export default function Team() {
  return (
    <main className="container py-16">
      <h1 className="text-2xl font-bold">Team</h1>
      <p className="text-muted-foreground mt-2">Capstone project team members.</p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="font-semibold">Alice Smith</div>
          <div className="text-sm text-muted-foreground">Frontend</div>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="font-semibold">Bob Lee</div>
          <div className="text-sm text-muted-foreground">Backend</div>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="font-semibold">Carol Nguyen</div>
          <div className="text-sm text-muted-foreground">DevOps</div>
        </div>
      </div>
    </main>
  );
}
