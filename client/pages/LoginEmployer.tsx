import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

export default function LoginEmployer() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: any) => {
    e.preventDefault();

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(username, email, password, "employer");
      }
      navigate("/dashboard/employer");
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
            {mode === "login" ? "Employer Login" : "Employer Registration"}
          </h1>
          <div className="text-sm text-muted-foreground">
            <button
              className="underline"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
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
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <div>
              <label className="block text-sm font-medium mb-2">
                Company Name
              </label>
              <Input
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

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Login as a different role?</p>
          <div className="mt-2 flex gap-2 justify-center">
            <a href="/login/student" className="underline">
              Student
            </a>
            <a href="/login/university" className="underline">
              University
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
