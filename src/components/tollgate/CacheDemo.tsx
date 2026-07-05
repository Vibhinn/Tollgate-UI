import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Cloud, Database, Zap } from "lucide-react";

export function CacheDemo() {
  const [tick, setTick] = useState(0);
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setTick((t) => t + 1);
      setSavings((s) => s + (Math.random() < 0.7 ? 0.012 : 0));
    }, 1600);
    return () => clearInterval(iv);
  }, []);

  const isHit = tick % 3 !== 0;

  return (
    <section className="relative border-b border-white/5 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mono text-xs uppercase tracking-widest text-cyan/80">// semantic cache</div>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Never pay for the same answer twice.
          </h2>
        </div>

        <div className="mt-14 grid items-stretch gap-5 md:grid-cols-[1fr_auto_1fr]">
          {/* Left column: request paths */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={tick}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.4 }}
                className="rounded-xl border border-white/10 bg-[color:var(--bg-elev)] p-4 mono text-xs"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Cloud className="h-3.5 w-3.5" />
                  <span>incoming</span>
                </div>
                <div className="mt-2 text-foreground/90">
                  {isHit
                    ? `"What is the capital of France?"`
                    : `"Summarize this novel in three sentences…"`}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Middle arrow */}
          <div className="flex items-center justify-center">
            <motion.div
              key={tick}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="hidden md:block"
            >
              <ArrowRight className="h-5 w-5 text-cyan" />
            </motion.div>
          </div>

          {/* Right column: result */}
          <div>
            <AnimatePresence mode="popLayout">
              {isHit ? (
                <motion.div
                  key={`hit-${tick}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flash-green rounded-xl border border-emerald/40 bg-emerald/5 p-4 mono text-xs"
                >
                  <div className="flex items-center gap-2 text-emerald">
                    <Zap className="h-3.5 w-3.5" />
                    <span>CACHE</span>
                    <span className="ml-auto rounded border border-emerald/40 bg-emerald/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald">
                      HIT
                    </span>
                  </div>
                  <div className="mt-2 text-foreground/90">Returned in 3ms · $0.000</div>
                </motion.div>
              ) : (
                <motion.div
                  key={`miss-${tick}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-xl border border-white/10 bg-[color:var(--bg-elev)] p-4 mono text-xs"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Database className="h-3.5 w-3.5" />
                    <span>MISS · routed to gpt-4o</span>
                    <span className="ml-auto rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold">
                      432ms
                    </span>
                  </div>
                  <div className="mt-2 text-foreground/90">Response stored for next time.</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Savings counter */}
        <div className="mx-auto mt-10 flex max-w-md items-center justify-between rounded-xl border border-emerald/25 bg-emerald/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald" />
            <span className="text-sm text-muted-foreground">Cost saved this session</span>
          </div>
          <span className="mono text-2xl font-semibold text-emerald">
            ${savings.toFixed(3)}
          </span>
        </div>
      </div>
    </section>
  );
}
