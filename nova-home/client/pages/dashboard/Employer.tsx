import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function EmployerDashboard() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [qrPayload, setQrPayload] = useState("");

  const doSearch = async () => {
    try {
      const data = await api(`/employer/search?q=${encodeURIComponent(query)}`);
      setResults(data.results || []);
    } catch (err:any) { alert(JSON.stringify(err)); }
  };

  const verifyFromQr = async () => {
    try {
      const parsed = JSON.parse(qrPayload);
      const data = await api('/blockchain/verify', { method: 'POST', body: JSON.stringify({ student_id: parsed.student_id }) });
      alert(data.valid ? 'Valid' : 'Invalid');
    } catch (err:any) { alert('Invalid QR payload or error'); }
  };

  return (
    <main className="container py-10">
      <h1 className="text-2xl font-bold">Employer Dashboard</h1>
      <p className="text-muted-foreground">Verify credentials by scanning QR or searching.</p>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Search Student</h3>
          <div className="mt-4 flex gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Roll No or Name or Email" className="flex-1 rounded-md border px-3 py-2" />
            <Button onClick={doSearch}>Search</Button>
          </div>
          <div className="mt-4 space-y-3">
            {results.map((r) => (
              <div key={r.student.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">ID: {r.student.id}</div>
                    <div className="text-sm text-muted-foreground">Verified: {r.verified ? 'Yes' : 'No'}</div>
                  </div>
                  <div>
                    <Button variant="ghost" onClick={() => alert(JSON.stringify(r))}>View</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Verify via QR Payload</h3>
          <textarea value={qrPayload} onChange={(e) => setQrPayload(e.target.value)} placeholder='Paste QR JSON payload like {"student_id":1,...}' className="mt-3 h-40 w-full rounded-md border p-3 text-sm" />
          <div className="mt-3 flex justify-end">
            <Button onClick={verifyFromQr}>Verify</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
