import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <ShieldCheck className="text-primary" />
          <span className="hidden sm:inline">
            Blockchain Academic Credentials
          </span>
          <span className="sm:hidden">BACV</span>
        </Link>

        <div className="hidden sm:flex items-center gap-4">
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/">Home</Link>
            {!user ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Signup</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}{" "}
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm hover:underline"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
          <ThemeToggle />
        </div>

        <div className="sm:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="-mr-2 inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent/10"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`sm:hidden ${open ? "block" : "hidden"} border-t bg-background/95`}
      >
        <div className="px-4 py-3">
          <nav className="flex flex-col gap-2">
            <Link to="/" onClick={() => setOpen(false)} className="py-2">
              Home
            </Link>
            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="py-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="py-2"
                >
                  Signup
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="py-2"
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}{" "}
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="py-2 text-left hover:underline"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
