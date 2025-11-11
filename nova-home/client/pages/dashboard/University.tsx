import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Stats from "@/components/sections/Stats";

export default function UniversityDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    loadTemplates();
    loadCertificates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await api("/university/templates");
      setTemplates(Object.entries(data.templates || {}).map(([id, t]: any) => ({ id, ...t })));
    } catch (err: any) {
      // ignore
    }
  };

  const doUpload = async (e: any) => {
    e.preventDefault();
    if (!file) return alert("Select a CSV file first");
    const form = new FormData();
    form.append("file", file);
    if (selectedTemplate) form.append("template_id", selectedTemplate);
    setUploading(true);
    try {
      const data = await api("/university/upload", { method: "POST", body: form });
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

  return (
    <main className="container py-10">
      <h1 className="text-2xl font-bold">University Dashboard</h1>
      <p className="text-muted-foreground">Upload student CSVs, manage templates and issue certificates.</p>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Upload Certificate Template</CardTitle>
          </CardHeader>
          <CardContent>
            <TemplateUploader onUploaded={(id) => { setSelectedTemplate(id); loadTemplates(); }} templates={templates} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Students (CSV)</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={doUpload} className="space-y-3">
              <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <div>
                <label className="block text-sm font-medium">Select template (optional)</label>
                <select className="mt-1 w-full rounded-md border px-3 py-2" value={selectedTemplate || ""} onChange={(e) => setSelectedTemplate(e.target.value || null)}>
                  <option value="">-- none --</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.filename}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Upload & Generate"}</Button>
                <Button variant="ghost" onClick={loadRecords}>Load Records</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Issued Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground">
                    <th>Cert ID</th>
                    <th>Student ID</th>
                    <th>Issued At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((c) => (
                    <tr key={c.cert_id} className="border-t">
                      <td className="py-2 align-top">{c.cert_id}</td>
                      <td className="py-2 align-top">{c.student_id}</td>
                      <td className="py-2 align-top">{new Date(c.generated_at).toLocaleString()}</td>
                      <td className="py-2 align-top">
                        <a className="inline-block mr-2" href={`/certificates/${c.cert_id}`}>Download</a>
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

function TemplateUploader({ onUploaded, templates }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [layout, setLayout] = useState<string>(JSON.stringify({ qr_position: [400, 400], qr_size: 200, name_position: [100, 200], cert_no_position: [100, 260], date_position: [100, 320] }, null, 2));
  const [uploading, setUploading] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    if (!file) return alert("Select an image file for the template");
    const form = new FormData();
    form.append("file", file);
    form.append("layout", layout);
    setUploading(true);
    try {
      const data = await api("/university/template/upload", { method: "POST", body: form });
      onUploaded(data.template_id);
      alert("Template uploaded");
    } catch (err: any) {
      alert(err?.error || JSON.stringify(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <label className="block text-sm font-medium">Layout JSON</label>
      <textarea className="w-full h-24 rounded-md border p-2 font-mono text-xs" value={layout} onChange={(e) => setLayout(e.target.value)} />
      <div className="flex gap-2">
        <Button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Upload Template"}</Button>
      </div>

      {templates.length > 0 && (
        <div>
          <h3 className="text-sm font-medium">Existing templates</h3>
          <ul className="text-xs">
            {templates.map((t: any) => <li key={t.id}>{t.filename}</li>)}
          </ul>
        </div>
      )}
    </form>
  );
}
