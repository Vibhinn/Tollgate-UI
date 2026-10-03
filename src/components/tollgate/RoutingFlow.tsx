import { Cpu, MessageSquare, Send, Sparkles, Zap } from "lucide-react";

const steps = [
  { icon: Send, label: "Your Request", sub: "OpenAI-compatible" },
  { icon: MessageSquare, label: "Tollgate Receives", sub: "auth + parse" },
  { icon: Cpu, label: "Local AI Classifies", sub: "SIMPLE · CODE · REASONING · CREATIVE", pulse: true },
  { icon: Sparkles, label: "Routing Engine", sub: "picks optimal model" },
  { icon: Zap, label: "Response", sub: "returned instantly" },
];

export function RoutingFlow() {
  return (
    <section id="routing" className="relative border-b border-white/5 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mono text-xs uppercase tracking-widest text-emerald/80">// how it works</div>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Smart routing, on your hardware.
          </h2>
        </div>

        <div className="mt-16 hidden lg:block">
          <div className="relative flex items-stretch justify-between gap-4">
            {steps.map((s, i) => (
              <div key={s.label} className="flex flex-1 items-center">
                <div className="flex-1">
                  <div className="group relative rounded-xl border border-white/10 bg-[color:var(--bg-elev)] p-4 text-center transition hover:border-emerald/40">
                    <div className="relative mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-emerald/25 bg-emerald/5 text-emerald">
                      <s.icon className="h-5 w-5" strokeWidth={1.5} />
                      {s.pulse && (
                        <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald/70" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald" />
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold">{s.label}</div>
                    <div className="mt-1 mono text-[11px] text-muted-foreground">{s.sub}</div>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <svg viewBox="0 0 60 20" className="mx-2 h-5 w-16 shrink-0 text-emerald">
                    <line x1="0" y1="10" x2="60" y2="10" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.4" className="animate-dash" />
                    <polygon points="55,5 60,10 55,15" fill="currentColor" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile stack */}
        <div className="mt-10 grid gap-4 lg:hidden">
          {steps.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-[color:var(--bg-elev)] p-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald/25 bg-emerald/5 text-emerald">
                  <s.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-sm font-semibold">{s.label}</div>
                  <div className="mono text-[11px] text-muted-foreground">{s.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-emerald/20 bg-emerald/5 p-6 text-center">
          <p className="text-base text-foreground/90 md:text-lg">
            The routing model runs entirely on your hardware.
            <br className="hidden md:inline" />
            <span className="text-muted-foreground">
              {" "}No extra API calls. No added latency. No data leaves your server.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
