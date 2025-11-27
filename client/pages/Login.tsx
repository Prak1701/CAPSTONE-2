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

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enrollment, setEnrollment] = useState("");
  const [company, setCompany] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const sendVerification = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your university email first.",
        variant: "destructive",
      });
      return;
    }
    try {
      await api("/auth/send_verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setVerificationSent(true);
      toast({
        title: "Verification sent",
        description:
          "A verification code was generated. Check your email (or dev server response).",
        variant: "default",
      });
    } catch (err: any) {
      const msg =
        err?.error ||
        err?.message ||
        JSON.stringify(err) ||
        "Failed to send verification";
      toast({
        title: "Verification error",
        description: String(msg),
        variant: "destructive",
      });
    }
  };

  const verifyCode = async () => {
    try {
      await api("/auth/verify_code", {
        method: "POST",
        body: JSON.stringify({ email, code: verificationCode }),
      });
      setEmailVerified(true);
      toast({
        title: "Email verified",
        description: "Your university email has been verified.",
        variant: "default",
      });
    } catch (err: any) {
      const msg =
        err?.error ||
        err?.message ||
        JSON.stringify(err) ||
        "Verification failed";
      toast({
        title: "Verification error",
        description: String(msg),
        variant: "destructive",
      });
    }
  };

  const submit = async (e: any) => {
    e.preventDefault();
    const domain = (email || "").split("@").pop()?.toLowerCase() || "";

    if (mode === "register") {
      if (role === "university") {
        if (domain !== "st.niituniversity.in") {
          toast({
            title: "Invalid university email",
            description:
              "University signups are restricted to @st.niituniversity.in",
            variant: "destructive",
          });
          return;
        }
        if (!emailVerified) {
          toast({
            title: "Email not verified",
            description:
              "Please verify your university email before signing up.",
            variant: "destructive",
          });
          return;
        }
      }
    }

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(username, email, password, role);
      }
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user?.role === "university") navigate("/dashboard/university");
      else if (user?.role === "employer") navigate("/dashboard/employer");
      else navigate("/dashboard/student");
    } catch (err: any) {
      const msg =
        err?.error || err?.message || JSON.stringify(err) || "Action failed";
      toast({
        title: mode === "login" ? "Login error" : "Signup error",
        description: String(msg),
        variant: "destructive",
      });
    }
  };

  return (
    <main className="container py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Select Your Role</h1>
          <p className="text-sm text-muted-foreground">
            Choose how you want to access the platform:
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <a
            href="/login/student"
            className="rounded-lg border bg-card p-4 text-center hover:bg-accent transition-colors cursor-pointer"
          >
            <div className="font-semibold text-sm">Student</div>
            <div className="text-xs text-muted-foreground mt-1">
              View credentials
            </div>
          </a>
          <a
            href="/login/university"
            className="rounded-lg border bg-card p-4 text-center hover:bg-accent transition-colors cursor-pointer"
          >
            <div className="font-semibold text-sm">University</div>
            <div className="text-xs text-muted-foreground mt-1">
              Upload records
            </div>
          </a>
          <a
            href="/login/employer"
            className="rounded-lg border bg-card p-4 text-center hover:bg-accent transition-colors cursor-pointer"
          >
            <div className="font-semibold text-sm">Employer</div>
            <div className="text-xs text-muted-foreground mt-1">
              Verify credentials
            </div>
          </a>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-muted-foreground">
              Or use combined login
            </span>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-lg border bg-card p-6"
        >
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailVerified(false);
                setVerificationSent(false);
              }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="university">University</option>
              <option value="student">Student</option>
              <option value="employer">Employer</option>
            </select>
          </div>

          {mode === "register" && role === "university" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button type="button" onClick={sendVerification}>
                  Send verification code
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setVerificationSent(false);
                    setVerificationCode("");
                    setEmailVerified(false);
                  }}
                >
                  Reset
                </Button>
              </div>
              {verificationSent && (
                <div>
                  <label className="block text-sm font-medium">
                    Verification code
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                  <div className="mt-2">
                    <Button type="button" onClick={verifyCode}>
                      Verify code
                    </Button>
                  </div>
                </div>
              )}
              {emailVerified && (
                <p className="text-sm text-green-600">Email verified ✓</p>
              )}
            </div>
          )}

          {mode === "register" && role === "student" && (
            <div>
              <label className="block text-sm font-medium">
                Enrollment number
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={enrollment}
                onChange={(e) => setEnrollment(e.target.value)}
              />
            </div>
          )}

          {mode === "register" && role === "employer" && (
            <div>
              <label className="block text-sm font-medium">Company name</label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button type="submit">
              {mode === "login" ? "Login" : "Register & Login"}
            </Button>
            <a href="/" className="text-sm text-muted-foreground underline">
              Back
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
