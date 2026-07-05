import { motion } from "framer-motion";
import { Lock, Server, ShieldCheck } from "lucide-react";

export function SelfHosted() {
  return (
    <section className="relative border-b border-white/5 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bg-elev)] p-12 text-center">
          <div aria-hidden className="absolute inset-0 bg-grid opacity-40" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,212,255,0.10),transparent_60%)]" />

          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="relative mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald/40 bg-emerald/10 text-emerald shadow-[0_0_40px_-6px_rgba(16,185,129,0.6)]"
          >
            <Lock className="h-7 w-7" strokeWidth={1.5} />
          </motion.div>

          <h2 className="relative text-4xl font-semibold tracking-tight md:text-5xl">
            Your keys. Your data. Your infrastructure.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
            Tollgate runs anywhere you can run Python or Docker. Nothing phones home.
          </p>

          <div className="relative mx-auto mt-12 grid max-w-3xl gap-4 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "No vendor lock-in" },
              { icon: Server, title: "Runs on any server" },
              { icon: Lock, title: "Encrypted config" },
            ].map((c) => (
              <div key={c.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <c.icon className="mx-auto mb-2 h-5 w-5 text-cyan" strokeWidth={1.5} />
                <div className="text-sm font-medium">{c.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
