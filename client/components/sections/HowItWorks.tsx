import { motion } from "framer-motion";
import { Upload, Database, QrCode, ScanSearch } from "lucide-react";

export default function HowItWorks() {
  return (
    <section id="how" className="bg-muted/30 py-20">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
        >
          How It Works
        </motion.h2>
        <div className="mx-auto mt-12 max-w-5xl grid grid-cols-1 gap-8 sm:grid-cols-3">
          <Step
            icon={<Upload className="text-primary" />}
            title="Upload"
            text="University uploads student data → Blockchain stores proof."
          />
          <Step
            icon={<QrCode className="text-primary" />}
            title="Generate QR"
            text="QR code generated and printed on certificates."
          />
          <Step
            icon={<ScanSearch className="text-primary" />}
            title="Verify"
            text="Employers scan QR or search to verify authenticity."
          />
        </div>
      </div>
    </section>
  );
}

function Step({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col items-center rounded-lg border bg-background p-6 text-center shadow-sm card-hover animate-fade-in-up"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </motion.div>
  );
}
