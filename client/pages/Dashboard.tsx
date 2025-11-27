import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, QrCode, ShieldCheck, Upload } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { title: "Issued Credentials", value: "1,248", icon: ShieldCheck },
    { title: "CSV Uploads", value: "32", icon: Upload },
    { title: "Verifications", value: "5,903", icon: QrCode },
    { title: "Anomalies Flagged", value: "3", icon: BarChart3 },
  ];

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Overview of credential issuance and verification activity.</p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title} className="transition-transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{s.title}</CardTitle>
              <s.icon className="text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
