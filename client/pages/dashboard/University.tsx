import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Stats from "@/components/sections/Stats";

export default function UniversityDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    loadCertificates();
  }, []);



  const doUpload = async (e: any) => {
    e.preventDefault();
    if (!file) return alert("Select a CSV file first");
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      const data = await api("/university/upload", {
        method: "POST",
        body: form,
      });
      alert(`Uploaded ${data.uploaded} rows`);
      loadRecords();
      loadCertificates();
    } catch (err: any) {
      alert(err?.error || JSON.stringify(err));
    } finally {
      setUploading(false);
    }
  };

  const loadRecords = async () => {
    try {
      const data = await api("/university/records");
      setStudents(data.students || []);
    } catch (err: any) {
      alert(err?.error || JSON.stringify(err));
    }
  };

  const loadCertificates = async () => {
    try {
      const data = await api("/university/certificates");
      setCertificates(data.certificates || []);
    } catch (err: any) {
      // ignore
    }
  };

  const clearAllRecords = async () => {
    if (!confirm("Are you sure you want to delete ALL your records? This cannot be undone!")) {
      return;
    }
    try {
      const data = await api("/university/clear-all", {
        method: "POST",
      });
      alert(`Deleted: ${data.deleted.certificates} certificates, ${data.deleted.students} students, ${data.deleted.proofs} proofs`);
      loadCertificates();
      loadRecords();
    } catch (err: any) {
      alert(err?.error || JSON.stringify(err));
    }
  };

  return (
    <main className="container py-10">
      <h1 className="text-2xl font-bold">University Dashboard</h1>
      <p className="text-muted-foreground">
        Upload student CSVs and automatically generate certificates.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

        <Card>
          <CardHeader>
            <CardTitle>Upload Students (CSV)</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={doUpload} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select CSV File
                </label>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload & Generate"}
                </Button>
                <Button variant="ghost" onClick={loadRecords}>
                  Load Records
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Issued Certificates</CardTitle>
              <Button
                variant="destructive"
                size="sm"
                onClick={clearAllRecords}
              >
                Delete All Records
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground">
                    <th>Cert ID</th>
                    <th>Student ID</th>
                    <th>Issued At</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((c) => (
                    <tr key={c.cert_id} className="border-t">
                      <td className="py-2 align-top">{c.cert_id}</td>
                      <td className="py-2 align-top">{c.student_id}</td>
                      <td className="py-2 align-top">
                        {new Date(c.generated_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & statistics */}
      <Stats />
    </main>
  );
}


