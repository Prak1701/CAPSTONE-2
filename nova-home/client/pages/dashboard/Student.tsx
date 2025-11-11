import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function StudentDashboard() {
  const [myRecord, setMyRecord] = useState<any | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [certs, setCerts] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user) return;
      try {
        const data = await api('/student/certificates');
        setCerts(data.certificates || []);
        if (data.certificates && data.certificates.length) {
          const first = data.certificates[0];
          const stud = await api('/university/records');
          const found = (stud.students || []).find((s:any) => s.id === first.student_id);
          setMyRecord(found || null);
        } else {
          const res = await api('/employer/search?q=' + encodeURIComponent(user.email));
          if (res.results && res.results.length) setMyRecord(res.results[0].student);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const genQr = async () => {
    if (!myRecord) return alert('No record found');
    try {
      const data = await api('/generate_qr', { method: 'POST', body: JSON.stringify({ student_id: myRecord.id }) });
      setQr(data.qr_base64);
    } catch (err: any) {
      alert(JSON.stringify(err));
    }
  };

  const verify = async () => {
    if (!myRecord) return alert('No record');
    try {
      const data = await api('/blockchain/verify', { method: 'POST', body: JSON.stringify({ student_id: myRecord.id }) });
      alert(data.valid ? 'Valid on blockchain' : 'Invalid or missing proof');
    } catch (err:any) { alert(JSON.stringify(err)); }
  };

  return (
    <main className="container py-10">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      <p className="text-muted-foreground">Manage and view your credential.</p>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">My Credential</h3>
            {!myRecord && <p className="text-muted-foreground mt-4">No credential found for your account.</p>}
            {myRecord && (
              <div className="mt-4">
                <pre className="max-w-full whitespace-pre-wrap text-sm">{JSON.stringify(myRecord.data, null, 2)}</pre>
                <div className="mt-4 flex gap-3">
                  <Button onClick={genQr}>Generate QR</Button>
                  <Button variant="ghost" onClick={verify}>Verify on Blockchain</Button>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-medium">My Certificates</h4>
                  {certs.length === 0 && <p className="text-muted-foreground">No certificates yet.</p>}
                  {certs.length > 0 && (
                    <ul className="mt-2 space-y-2 text-sm">
                      {certs.map((c) => (
                        <li key={c.cert_id} className="flex items-center justify-between">
                          <div>
                            <div>Cert #{c.cert_id}</div>
                            <div className="text-xs text-muted-foreground">Issued at: {new Date(c.generated_at).toLocaleString()}</div>
                          </div>
                          <div>
                            <a className="mr-2" href={`/certificates/${c.cert_id}`} target="_blank">Download</a>
                            {c.emailed_to && <span className="text-xs text-muted-foreground">Emailed</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="rounded-lg border bg-card p-6 text-center">
            <h4 className="text-md font-medium">QR Code</h4>
            {qr ? (
              <img alt="qr" src={`data:image/png;base64,${qr}`} className="mx-auto mt-4 w-48" />
            ) : (
              <p className="text-muted-foreground mt-4">No QR generated yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
