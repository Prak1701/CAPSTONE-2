import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function EmployerDashboard() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const doSearch = async () => {
    try {
      const data = await api(`/employer/search?q=${encodeURIComponent(query)}`);
      setResults(data.results || []);
    } catch (err: any) {
      alert(JSON.stringify(err));
    }
  };

  return (
    <main className="container py-10">
      <h1 className="text-2xl font-bold">Employer Dashboard</h1>
      <p className="text-muted-foreground">
        Search for students and verify their credentials. To verify a certificate, scan the QR code on the certificate with your phone.
      </p>

      <div className="mt-6">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Search Student Credentials</h3>
          <div className="mt-4 flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, enrollment number, or ID"
              className="flex-1 rounded-md border px-3 py-2"
              onKeyPress={(e) => e.key === "Enter" && doSearch()}
            />
            <Button onClick={doSearch}>Search</Button>
          </div>

          {results.length === 0 && query && (
            <p className="mt-4 text-sm text-muted-foreground">
              No results found. Try searching by name, email, or enrollment number.
            </p>
          )}

          <div className="mt-4 space-y-4">
            {results.map((r) => (
              <div
                key={r.student.id}
                className="rounded-md border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-lg">Student ID: {r.student.id}</div>
                  <div>
                    <span
                      className={
                        r.verified
                          ? "text-green-600 font-medium text-sm px-3 py-1 bg-green-50 rounded-full"
                          : "text-yellow-600 font-medium text-sm px-3 py-1 bg-yellow-50 rounded-full"
                      }
                    >
                      {r.verified ? "✓ Verified on Blockchain" : "⚠ Not Verified"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(r.student.data || {}).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="font-medium text-muted-foreground">{key}</span>
                      <span className="text-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>

                {r.proof && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <span className="font-medium">Blockchain Hash:</span> {r.proof.hash?.substring(0, 32)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-lg border bg-blue-50 p-6">
          <h3 className="text-lg font-semibold text-blue-900">📱 How to Verify Certificates</h3>
          <div className="mt-3 space-y-2 text-sm text-blue-800">
            <p><strong>Step 1:</strong> Ask the student to show you their certificate (digital or printed)</p>
            <p><strong>Step 2:</strong> Scan the QR code on the certificate with your phone camera</p>
            <p><strong>Step 3:</strong> Your phone will automatically open a verification page showing:</p>
            <ul className="ml-6 list-disc space-y-1 mt-2">
              <li>Certificate verification status (✅ Verified or ⚠️ Warning)</li>
              <li>Student details (name, enrollment, degree, etc.)</li>
              <li>Certificate number and issue date</li>
              <li>Blockchain verification status</li>
            </ul>
            <p className="mt-3 font-medium">No manual entry needed - just scan and verify!</p>
          </div>
        </div>
      </div>
    </main>
  );
}
