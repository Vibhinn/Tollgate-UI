import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Line = {
  id: number;
  text: string;
  tag: string;
  color: string;
  hit?: boolean;
};

const templates: Omit<Line, "id">[] = [
  { text: "POST /v1/chat/completions  →  gpt-4o", tag: "fast", color: "#00D4FF" },
  { text: "POST /v1/chat/completions  →  claude-sonnet-4", tag: "smart", color: "#7C3AED" },
  { text: "POST /v1/chat/completions  →  CACHE", tag: "HIT ✓", color: "#10B981", hit: true },
  { text: "POST /v1/chat/completions  →  gemini-2.5-flash", tag: "cheap", color: "#4285F4" },
  { text: "POST /v1/embeddings        →  text-embedding-3-small", tag: "route", color: "#00D4FF" },
  { text: "POST /v1/chat/completions  →  gpt-4o-mini", tag: "cheap", color: "#4285F4" },
  { text: "POST /v1/chat/completions  →  CACHE", tag: "HIT ✓", color: "#10B981", hit: true },
];

export function WhatIs() {
  const [lines, setLines] = useState<Line[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const iv = setInterval(() => {
      const t = templates[Math.floor(Math.random() * templates.length)];
      setLines((prev) => [...prev, { ...t, id: nextId.current++ }].slice(-9));
    }, 1100);
    return () => clearInterval(iv);
  }, []);

  return (
    <section className="relative border-b border-white/5 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-2 md:items-center">
        <div>
          <div className="mono text-xs uppercase tracking-widest text-cyan/80">// what is tollgate</div>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            A single door in front of every LLM you use.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Tollgate is a self-hosted API gateway that sits in front of your LLM calls.
            It authenticates users, routes to the right model, caches repeated queries,
            and tracks analytics — so you spend less and ship faster.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 mono text-xs">
            {["auth", "routing", "cache", "rate-limits", "analytics"].map((t) => (
              <span key={t} className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Terminal mockup */}
        <div className="rounded-xl border border-white/10 bg-[color:var(--bg-elev)] shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            </div>
            <span className="mono text-[11px] text-muted-foreground">tollgate ~ live requests</span>
            <span className="mono text-[11px] text-emerald">● live</span>
          </div>
          <div className="h-[320px] overflow-hidden px-4 py-3 mono text-[12.5px] leading-relaxed">
            <div className="flex flex-col-reverse">
              {[...lines].reverse().map((l) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-center gap-2 py-1 ${l.hit ? "flash-green" : ""}`}
                >
                  <span className="text-muted-foreground/50">
                    {new Date().toLocaleTimeString("en-US", { hour12: false })}
                  </span>
                  <span className="text-foreground/90">{l.text}</span>
                  <span className="ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ color: l.color, backgroundColor: `${l.color}18`, border: `1px solid ${l.color}33` }}>
                    {l.tag}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
