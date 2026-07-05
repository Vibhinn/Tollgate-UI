import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Github, Terminal } from "lucide-react";
import { NetworkGraph } from "./NetworkGraph";
import { Typewriter } from "./Typewriter";

export function Hero() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText("pip install tollgate");
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <section className="noise relative overflow-hidden border-b border-white/5">
      {/* Ambient */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-cyan/10 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute top-40 right-0 h-[380px] w-[520px] rounded-full bg-violet/15 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-8 text-center md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/5 px-3 py-1 mono text-[11px] text-cyan"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
          </span>
          Smart routing powered by local AI
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mx-auto mt-6 max-w-4xl text-5xl font-bold tracking-tight text-foreground md:text-7xl"
        >
          One Gateway.{" "}
          <span className="text-glow-cyan text-cyan">Every LLM.</span>
        </motion.h1>

        <div className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          <Typewriter
            phrases={[
              "Route to the smartest model.",
              "Route to the cheapest model.",
              "Route to the fastest model.",
            ]}
          />
        </div>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={copy}
            className="group inline-flex items-center gap-3 rounded-md bg-cyan px-5 py-3 mono text-sm font-semibold text-[color:var(--primary-foreground)] transition hover:brightness-110 border-glow-cyan"
          >
            <Terminal className="h-4 w-4" />
            <span>{copied ? "Copied!" : "pip install tollgate"}</span>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 opacity-70" />}
          </button>
          <a
            href="https://github.com"
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.02] px-5 py-3 text-sm font-medium text-foreground/90 transition hover:border-cyan/40 hover:bg-white/[0.05]"
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
        </div>

        {/* Network graph */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mx-auto mt-10 max-w-6xl"
        >
          <NetworkGraph />
        </motion.div>

        {/* Proof bar */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mono text-xs text-muted-foreground/70">
          <span>OpenAI</span>
          <span className="text-muted-foreground/30">·</span>
          <span>Anthropic</span>
          <span className="text-muted-foreground/30">·</span>
          <span>Gemini</span>
          <span className="text-muted-foreground/30">·</span>
          <span className="italic">More coming soon</span>
        </div>
      </div>
    </section>
  );
}
