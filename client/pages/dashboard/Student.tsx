import { useEffect, useState } from "react";
import { api, API_BASE } from "@/lib/api";
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
        const data = await api(
          "/student/certificates?email=" + encodeURIComponent(user.email),
        );
        setCerts(data.certificates || []);
        if (data.certificates && data.certificates.length) {
          const first = data.certificates[0];
          setMyRecord(first.student_data || null);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const genQr = async () => {
    if (!certs || certs.length === 0) return alert("No certificate found");
    try {
      // Use student_record_id from certificate, or fallback to student_id from certificate
      const cert = certs[0];
      const studentId = cert.student_record_id || cert.student_id;
      const certId = cert.cert_id; // Get cert_id

      if (!studentId) {
        alert("Student ID not found in certificate");
        return;
      }
      const data = await api("/generate_qr", {
        method: "POST",
        body: JSON.stringify({ student_id: studentId, cert_id: certId }),
      });
      setQr(data.qr_base64);
    } catch (err: any) {
      alert(err?.error || JSON.stringify(err));
    }
  };

  // Verify function removed as requested

  return (
    <main className="container py-10">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      <p className="text-muted-foreground">View and verify your credentials.</p>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">My Credential</h3>
            {!myRecord && (
              <p className="text-muted-foreground mt-4">
                No credential found for your account. Please contact your
                university.
              </p>
            )}
            {myRecord && (
              <div className="mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(myRecord).map(([key, value]) => (
                    <div key={key}>
                      <div className="font-medium text-muted-foreground">
                        {key}
                      </div>
                      <div>{String(value)}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-3">
                  <Button onClick={genQr}>Generate QR</Button>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-medium">My Certificates</h4>
                  {certs.length === 0 && (
                    <p className="text-muted-foreground">
                      No certificates yet.
                    </p>
                  )}
                  {certs.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {certs.map((c) => (
                        <div
                          key={c.cert_id}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div>
                            <div className="font-semibold">
                              Certificate #{c.cert_id}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Issued:{" "}
                              {new Date(c.generated_at).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              className="text-sm font-medium text-primary hover:underline"
                              href={`${API_BASE}/certificates/${c.cert_id}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Download
                            </a>
                            {c.emailed_to && (
                              <span className="text-xs text-muted-foreground">
                                ✓ Emailed
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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
              <img
                alt="qr"
                src={`data:image/png;base64,${qr}`}
                className="mx-auto mt-4 w-48"
              />
            ) : (
              <p className="text-muted-foreground mt-4">
                Generate QR to share your certificate.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
