import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative isolate">
      <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/60 via-background/70 to-background" />
      <div className="container flex min-h-[80svh] flex-col items-center justify-center py-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="hero-title max-w-4xl text-4xl tracking-tight sm:text-5xl md:text-6xl animate-fade-in-up"
        >
          Blockchain-Based Academic Credential Verification
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 max-w-2xl text-lg text-muted-foreground animate-fade-in-up"
        >
          Secure and Transparent Verification of Academic Credentials using Blockchain. Our system stores cryptographic proofs on-chain, ensuring tamper-evident validation of student records while protecting privacy.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-2 max-w-2xl text-muted-foreground animate-fade-in-up"
        >
          Universities batch-upload records, certificates receive verifiable QR codes, and employers verify instantly by scanning or searching.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <a href="/dashboard" className="hidden"></a>
          <Button asChild size="lg" className="shadow-lg shadow-primary/30">
            <a href="/dashboard">Explore Dashboard</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
