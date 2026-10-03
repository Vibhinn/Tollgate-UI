import { motion } from "framer-motion";
import {
  BarChart3,
  Brain,
  Database,
  Gauge,
  KeyRound,
  Network,
  type LucideIcon,
} from "lucide-react";

type F = { icon: LucideIcon; title: string; body: string };

const features: F[] = [
  {
    icon: Brain,
    title: "Smart Routing",
    body: "Say fast, cheap, or smart. A local 0.5B model classifies your request and picks the optimal provider automatically.",
  },
  {
    icon: Database,
    title: "Semantic Cache",
    body: "Vector embeddings + exact-match cache powered by Redis and Qdrant. Identical and similar queries return instantly.",
  },
  {
    icon: Gauge,
    title: "Rate Limiting",
    body: "Token bucket rate limiting per user. Configure requests-per-second and burst capacity via the setup wizard.",
  },
  {
    icon: Network,
    title: "Multi-Provider",
    body: "OpenAI, Anthropic, and Gemini behind a single unified API endpoint. Add providers without changing your app.",
  },
  {
    icon: KeyRound,
    title: "Auth & Tokens",
    body: "Bearer token authentication out of the box. Generate scoped tokens for each client or team.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    body: "Every request tracked — latency, token usage, cost per model. EMA-based model scoring keeps routing accurate over time.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative border-b border-white/5 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mono text-xs uppercase tracking-widest text-emerald/80">// capabilities</div>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Everything you need in one gateway.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Batteries included. Configure once, ship forever.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-xl border border-emerald/10 bg-[color:var(--bg-elev)]/70 p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald/50 hover:shadow-[0_0_40px_-8px_rgba(16,185,129,0.35)]"
            >
              <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald/10 opacity-0 blur-3xl transition group-hover:opacity-100" />
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald/25 bg-emerald/5 text-emerald">
                <f.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
