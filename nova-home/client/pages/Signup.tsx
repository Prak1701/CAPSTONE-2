import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const COMMON_PUBLIC_EMAILS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
];

export default function Signup() {
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enrollment, setEnrollment] = useState("");
  const [company, setCompany] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const sendVerification = async () => {
    if (!email) {
      toast({ title: "Email required", description: "Please enter your university email first.", variant: "destructive" });
      return;
    }
    try {
      await api("/auth/send_verification", { method: "POST", body: JSON.stringify({ email }) });
      setVerificationSent(true);
      toast({ title: "Verification sent", description: "A verification code was generated. Check your email (or the response in dev).", variant: "default" });
    } catch (err: any) {
      const msg = err?.error || err?.message || JSON.stringify(err) || "Failed to send verification";
      toast({ title: "Verification error", description: String(msg), variant: "destructive" });
    }
  };

  const verifyCode = async () => {
    try {
      await api("/auth/verify_code", { method: "POST", body: JSON.stringify({ email, code: verificationCode }) });
      setEmailVerified(true);
      toast({ title: "Email verified", description: "Your university email has been verified.", variant: "default" });
    } catch (err: any) {
      const msg = err?.error || err?.message || JSON.stringify(err) || "Verification failed";
      toast({ title: "Verification error", description: String(msg), variant: "destructive" });
    }
  };

  const submit = async (e: any) => {
    e.preventDefault();
    const domain = (email || "").split("@").pop()?.toLowerCase() || "";
    if (role === "university") {
      if (domain !== "st.niituniversity.in") {
        toast({ title: "Invalid university email", description: "University signups are restricted to @st.niituniversity.in", variant: "destructive" });
        return;
      }
      if (!emailVerified) {
        toast({ title: "Email not verified", description: "Please verify your university email before signing up.", variant: "destructive" });
        return;
      }
    }

    if (role === "student" && COMMON_PUBLIC_EMAILS.includes(domain)) {
      // Allow public emails for students but warn
      // no-op: students can sign up with public emails
    }

    try {
      await register(username, email, password, role);
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user?.role === "university") navigate("/dashboard/university");
      else if (user?.role === "employer") navigate("/dashboard/employer");
      else navigate("/dashboard/student");
    } catch (err: any) {
      const msg = err?.error || err?.message || JSON.stringify(err) || "Signup failed";
      toast({ title: "Signup error", description: String(msg), variant: "destructive" });
    }
  };

  return (
    <main className="container py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create an account</h1>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-lg border bg-card p-6">
          <div>
            <label className="block text-sm font-medium">Role</label>
            <select className="mt-1 w-full rounded-md border px-3 py-2" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="university">University</option>
              <option value="student">Student</option>
              <option value="employer">Employer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Username</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input type="email" className="mt-1 w-full rounded-md border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          {role === "university" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button type="button" onClick={sendVerification}>Send verification code</Button>
                <Button type="button" variant="secondary" onClick={() => { setVerificationSent(false); setVerificationCode(""); setEmailVerified(false); }}>Reset</Button>
              </div>
              {verificationSent && (
                <div>
                  <label className="block text-sm font-medium">Verification code</label>
                  <input className="mt-1 w-full rounded-md border px-3 py-2" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
                  <div className="mt-2">
                    <Button type="button" onClick={verifyCode}>Verify code</Button>
                  </div>
                </div>
              )}
              {emailVerified && <p className="text-sm text-green-600">Email verified ✓</p>}
            </div>
          )}

          {role === "student" && (
            <div>
              <label className="block text-sm font-medium">Enrollment number</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={enrollment} onChange={(e) => setEnrollment(e.target.value)} />
            </div>
          )}

          {role === "employer" && (
            <div>
              <label className="block text-sm font-medium">Company name</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" className="mt-1 w-full rounded-md border px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="flex items-center justify-between">
            <Button type="submit">Signup</Button>
            <a href="/login" className="text-sm text-muted-foreground underline">Already have an account?</a>
          </div>
        </form>
      </div>
    </main>
  );
}
