import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Upload, ShieldCheck, QrCode, Users2, BarChart3 } from "lucide-react";

const items = [
  { icon: Upload, title: "CSV Batch Upload", desc: "Universities upload student records in bulk with CSV for efficient onboarding." },
  { icon: ShieldCheck, title: "Blockchain Integrity", desc: "Cryptographic hashes on blockchain ensure tamper-evident verification." },
  { icon: QrCode, title: "QR Code Verification", desc: "Each credential includes a QR code for instant authenticity checks." },
  { icon: Users2, title: "Role-based Access", desc: "Granular roles for University, Student, and Employer with secure access." },
  { icon: BarChart3, title: "Dashboard Stats", desc: "Real-time insights: issued credentials, verifications, and anomalies." },
];

export default function Features() {
  return (
    <section id="features" className="container py-20">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
      >
        Key Features
      </motion.h2>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <Card className="h-full card-hover transition-transform hover:-translate-y-1 hover:shadow-lg animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <item.icon className="text-primary" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
