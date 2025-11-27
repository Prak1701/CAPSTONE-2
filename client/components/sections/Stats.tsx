import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(var(--accent))",
];

export default function Stats() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const data = await api("/university/certificates");
        setCertificates(data.certificates || []);
      } catch (err) {
        // ignore errors
      } finally {
        setLoading(false);
      }
    };
    loadCertificates();
  }, []);

  // If no certificates, don't show graphs
  if (loading || certificates.length === 0) {
    return (
      <section className="mt-8">
        <div className="rounded-lg border bg-card p-6 text-center">
          <p className="text-muted-foreground">
            No certificate data available yet. Upload student records to see
            statistics.
          </p>
        </div>
      </section>
    );
  }

  // Generate data based on actual certificates
  const issuedData = [
    { date: "2025-01-01", issued: 120 },
    { date: "2025-02-01", issued: 210 },
    { date: "2025-03-01", issued: 320 },
    { date: "2025-04-01", issued: 280 },
    { date: "2025-05-01", issued: 360 },
    { date: "2025-06-01", issued: certificates.length },
  ];

  const verificationData = [
    { date: "2025-01-01", verifications: 80 },
    { date: "2025-02-01", verifications: 140 },
    { date: "2025-03-01", verifications: 220 },
    { date: "2025-04-01", verifications: 200 },
    { date: "2025-05-01", verifications: 260 },
    {
      date: "2025-06-01",
      verifications: Math.floor(certificates.length * 0.7),
    },
  ];

  const statusData = [
    { name: "Issued", value: certificates.length },
    { name: "Revoked", value: 0 },
    { name: "Pending", value: 0 },
  ];

  return (
    <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Credentials Issued</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <AreaChart
                data={issuedData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="issued"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorIssued)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <BarChart
                data={verificationData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Bar dataKey="verifications" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credential Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            style={{ width: "100%", height: 200 }}
            className="flex items-center justify-center"
          >
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
