export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 py-6 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Blockchain-Based Academic Credential Verification</p>
        <p className="text-xs">Secure • Transparent • Verifiable</p>
      </div>
    </footer>
  );
}

export default Footer;
