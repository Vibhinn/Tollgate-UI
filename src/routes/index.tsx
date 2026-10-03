import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownRight, ArrowRight, Check, Copy, Github, Server, ShieldCheck, Zap } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Install } from "@/components/tollgate/Install";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tollgate — The self-hosted LLM proxy" },
      { name: "description", content: "One self-hosted gateway for OpenAI, Anthropic, and Gemini. Tested at 341 requests per second on a single worker under 50 concurrent requests." },
      { property: "og:title", content: "Tollgate — The self-hosted LLM proxy" },
      { property: "og:description", content: "Route, cache, and control every LLM request. See the single-worker benchmark against LiteLLM." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const ease = [0.16, 1, 0.3, 1] as const;
const reveal = { initial: { opacity: 0, y: 36 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: 0.75, ease } };

function ProxyDiagram() {
  return (
    <div className="proxy-diagram" aria-label="Application requests pass through Tollgate to OpenAI, Anthropic, and Gemini">
      <div className="diagram-top"><span>01 / THE PROXY</span><span className="diagram-live"><span /> REQUEST FLOW</span></div>
      <div className="diagram-field">
        <svg className="diagram-lines" viewBox="0 0 720 330" preserveAspectRatio="none" aria-hidden="true">
          <path d="M84 165 H340" /><path d="M382 165 C480 165 480 52 612 52" /><path d="M382 165 H612" /><path d="M382 165 C480 165 480 278 612 278" />
          <circle className="packet packet-one" r="5" /><circle className="packet packet-two" r="5" /><circle className="packet packet-three" r="5" />
        </svg>
        <div className="diagram-app"><span className="diagram-node-mark">{`{ }`}</span><span>YOUR APP</span></div>
        <div className="diagram-gate"><span className="gate-icon">╫</span><strong>TG</strong><small>AUTH / ROUTE / CACHE</small></div>
        <div className="diagram-providers"><span><i className="provider-dot provider-openai" /> OpenAI</span><span><i className="provider-dot provider-anthropic" /> Anthropic</span><span><i className="provider-dot provider-gemini" /> Gemini</span></div>
      </div>
      <div className="diagram-bottom"><span>ONE ENDPOINT.</span><span>EVERY MODEL. ↗</span></div>
    </div>
  );
}

function Landing() {
  const [copied, setCopied] = useState(false);
  const reduced = useReducedMotion();
  async function copyInstall() {
    try { await navigator.clipboard.writeText("pip install tollgate"); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* Clipboard permissions vary by browser. */ }
  }
  return (
    <main className="site-shell">
      <header className="site-nav">
        <a href="#top" className="nav-wordmark" aria-label="Tollgate home"><span className="nav-symbol">╫</span> TOLLGATE<span className="nav-period">.</span></a>
        <nav aria-label="Main navigation"><a href="#benchmark">Benchmark</a><a href="#how-it-works">How it works</a><a href="#install">Install</a></nav>
        <a href="#install" className="nav-action">GET STARTED <ArrowRight size={15} /></a>
      </header>

      <section id="top" className="editorial-hero">
        <div className="hero-inner">
          <motion.div className="hero-kicker" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>OPEN-SOURCE LLM INFRASTRUCTURE <span> / </span> SELF-HOSTED</motion.div>
          <motion.h1 initial={reduced ? false : { opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}><span>TOLL</span><span className="outline-title">GATE<span className="title-period">.</span></span></motion.h1>
          <div className="hero-lower">
            <motion.div className="hero-index" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>THE LLM PROXY<br />THAT DOES MORE.<br />WITHOUT GETTING IN THE WAY.</motion.div>
            <motion.div className="hero-message" initial={reduced ? false : { opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.8, ease }}>
              <p>One gateway between your app and every model. <strong>Route intelligently. Cache what matters. Keep control.</strong></p>
              <div className="hero-actions"><Button onClick={copyInstall} className="install-command">{copied ? <Check /> : <Copy />}{copied ? "COPIED" : "pip install tollgate"}</Button><a href="#benchmark" className="text-action">SEE THE NUMBERS <ArrowDownRight size={19} /></a></div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="benchmark" className="benchmark-section">
        <div className="section-wrap">
          <motion.div {...reveal} className="section-heading benchmark-heading"><div className="eyebrow">02 / MEASURED, NOT MARKETED</div><h2>THE NUMBERS<br /><span className="outline-title">HOLD UP.</span></h2><p>Same machine. Same upstream. One worker each. Here’s what happened under load.</p></motion.div>
          <div className="benchmark-grid">
            <motion.div {...reveal} className="benchmark-main"><span className="metric-label">SINGLE-WORKER THROUGHPUT / 50 CONCURRENT</span><strong>~1.9<span>×</span></strong><p>the throughput of LiteLLM <em>per core</em>.</p><div className="comparison-row"><span>TOLLGATE</span><b>341 req/s</b><div className="bar-track"><div className="bar-fill bar-tollgate" /></div></div><div className="comparison-row"><span>LITELLM</span><b>177 req/s</b><div className="bar-track"><div className="bar-fill bar-litellm" /></div></div></motion.div>
            <motion.div {...reveal} className="benchmark-aside"><span className="metric-label">MEDIAN LATENCY / UNDER LOAD</span><strong>130<span>ms</span></strong><p>vs 268 ms for LiteLLM at 50 concurrent requests. About half the median latency under load.</p><div className="aside-rule" /><span className="metric-label">SINGLE-REQUEST OVERHEAD</span><strong className="aside-number">~5<span>ms</span></strong><p>For both gateways. This is a throughput result, <em>not</em> a claim of faster individual responses.</p></motion.div>
          </div>
          <details className="methodology"><summary>BENCHMARK METHODOLOGY <span>+</span></summary><p>Benchmarked October 2026 on an Apple Silicon laptop. Tollgate commit 1ef9f76 vs LiteLLM proxy 1.103.2; Python 3.14, one uvicorn worker with uvloop + httptools. Both forwarded to the same local mock OpenAI-compatible server (22k+ req/s on its own). Non-streaming, ab with keep-alive: 10,000 requests at 50 concurrent, two alternating rounds. Tollgate used Redis-backed auth, rate limiting, backpressure, and exact + semantic cache lookup. LiteLLM used a master key only, without database, cache, or rate limits. These numbers measure gateway overhead, not real-provider response time.</p></details>
        </div>
      </section>

      <section id="how-it-works" className="product-section"><div className="section-wrap">
        <motion.div {...reveal} className="product-intro"><div className="eyebrow">03 / ONE DOOR. EVERY MODEL.</div><h2>YOUR APP TALKS<br />TO <span className="outline-title">TOLLGATE.</span></h2><p>Tollgate handles the rest. OpenAI, Anthropic, and Gemini behind one OpenAI-compatible endpoint, running on your own infrastructure.</p></motion.div>
        <ProxyDiagram />
        <div className="feature-rows">
          <motion.div {...reveal} className="feature-row"><span className="feature-number">01</span><h3>ROUTE<br />SMARTER.</h3><p>Choose fast, cheap, or smart. A local classifier directs requests to the right provider without rewriting your application.</p><ArrowDownRight aria-hidden /></motion.div>
          <motion.div {...reveal} className="feature-row"><span className="feature-number">02</span><h3>STOP PAYING<br />TWICE.</h3><p>Exact-match and semantic caching catch repeat and similar requests before they ever reach a paid model.</p><ArrowDownRight aria-hidden /></motion.div>
          <motion.div {...reveal} className="feature-row"><span className="feature-number">03</span><h3>KEEP<br />CONTROL.</h3><p>Token auth, rate limits, backpressure, and request analytics stay where they belong: in front of every provider.</p><ArrowDownRight aria-hidden /></motion.div>
        </div>
      </div></section>

      <section className="ownership-section"><div className="section-wrap ownership-inner"><div className="eyebrow">04 / BUILT TO BE YOURS</div><h2>YOUR KEYS.<br />YOUR DATA.<br /><span>YOUR RULES.</span></h2><div className="ownership-bottom"><p>Self-host with Python or Docker. Your gateway, your infrastructure, and no vendor lock-in.</p><div><span><Server size={18} /> SELF-HOSTED</span><span><ShieldCheck size={18} /> TOKEN AUTH</span><span><Zap size={18} /> RATE LIMITS</span></div></div></div></section>
      <Install />
      <footer className="site-footer"><div className="section-wrap"><a href="#top" className="footer-logo">TOLLGATE<span>.</span></a><div><span>OPEN SOURCE. SELF-HOSTED. BUILT FOR THE WAY YOU SHIP.</span><a href="#top">BACK TO TOP ↑</a></div></div></footer>
    </main>
  );
}
