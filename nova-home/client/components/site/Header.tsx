import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <ShieldCheck className="text-primary" />
          <span className="hidden sm:inline">Blockchain Academic Credentials</span>
          <span className="sm:hidden">BACV</span>
        </Link>

        <div className="hidden sm:flex items-center gap-4">
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </nav>
          <ThemeToggle />
        </div>

        <div className="sm:hidden flex items-center gap-2">
          <ThemeToggle />
          <button aria-label="Toggle menu" onClick={() => setOpen((v) => !v)} className="-mr-2 inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent/10">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${open ? 'block' : 'hidden'} border-t bg-background/95`}>
        <div className="px-4 py-3">
          <nav className="flex flex-col gap-2">
            <Link to="/" onClick={() => setOpen(false)} className="py-2">Home</Link>
            <Link to="/login" onClick={() => setOpen(false)} className="py-2">Login</Link>
            <Link to="/signup" onClick={() => setOpen(false)} className="py-2">Signup</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
