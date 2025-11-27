import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

export default function LoginUniversity() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        description: "A verification code was generated. Check your email.",
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
          description: "Please verify your university email before signing up.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(username, email, password, "university");
      }
      navigate("/dashboard/university");
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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {mode === "login" ? "University Login" : "University Registration"}
          </h1>
          <div className="text-sm text-muted-foreground">
            <button
              className="underline"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setEmailVerified(false);
                setVerificationSent(false);
              }}
            >
              {mode === "login" ? "Create an account" : "Have an account?"}
            </button>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-lg border bg-card p-6"
        >
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              University Email (@st.niituniversity.in)
            </label>
            <Input
              type="email"
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
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === "register" && (
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
                  <label className="block text-sm font-medium mb-2">
                    Verification code
                  </label>
                  <Input
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

          <div className="flex items-center justify-between">
            <Button type="submit">
              {mode === "login" ? "Login" : "Register & Login"}
            </Button>
            <a href="/" className="text-sm text-muted-foreground underline">
              Back
            </a>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Login as a different role?</p>
          <div className="mt-2 flex gap-2 justify-center">
            <a href="/login/student" className="underline">
              Student
            </a>
            <a href="/login/employer" className="underline">
              Employer
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
