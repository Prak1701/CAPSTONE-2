import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function Verify() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      const res = await api("/verify_token", { method: "POST", body: JSON.stringify({ token }) });
      setResult(res);
    } catch (err: any) {
      setResult({ error: err?.error || err?.message || JSON.stringify(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-16">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold">Verify Certificate</h1>
        <p className="text-muted-foreground">Paste the token from the QR or enter the token string here.</p>

        <form onSubmit={submit} className="mt-6 space-y-4 rounded-lg border bg-card p-6">
          <div>
            <label className="block text-sm font-medium">Token</label>
            <textarea value={token} onChange={(e) => setToken(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 h-24" />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify"}</Button>
          </div>
        </form>

        {result && (
          <div className="mt-6 rounded-lg border bg-card p-4">
            <h3 className="text-lg font-semibold">Result</h3>
            <pre className="text-xs mt-2 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </main>
  );
}
