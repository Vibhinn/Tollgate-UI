import { useState } from "react";
import { TypedCode } from "./TypedCode";

const pipCode = `# Install Tollgate from PyPI
pip install tollgate

# Verify the install
tollgate --version`;

const dockerCode = `# Pull and run with Docker Compose
docker compose up

# Or use the prebuilt image
docker run -p 8000:8000 ghcr.io/tollgate/tollgate:latest`;

const wizard = [
  "┌──────────────────────────────────────────┐",
  "│   T O L L G A T E   ·   setup wizard     │",
  "└──────────────────────────────────────────┘",
  "› Select providers:  [x] OpenAI  [x] Anthropic  [x] Gemini",
  "› Rate limit (rps):  10   burst: 30",
  "› Cache backend:     redis://localhost:6379",
  "› Vector store:      qdrant://localhost:6333",
  "✓ Config written to ~/.tollgate/config.yaml",
];

const startCode = `$ tollgate start

  ✓ Loaded config from ~/.tollgate/config.yaml
  ✓ Connected: redis · qdrant · classifier (0.5B)
  ✓ Providers ready: openai, anthropic, gemini

  Tollgate running on http://localhost:8000
`;

const usageCode = `from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="tg_live_...",
)

resp = client.chat.completions.create(
    model="smart",           # or "fast" / "cheap"
    messages=[{"role": "user", "content": "Hi"}],
)
print(resp.choices[0].message.content)`;

export function Install() {
  const [tab, setTab] = useState<"pip" | "docker">("pip");
  return (
    <section id="install" className="relative border-b border-white/5 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mono text-xs uppercase tracking-widest text-cyan/80">// quickstart</div>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Get running in minutes.
          </h2>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-[220px_1fr]">
          {/* Stepper */}
          <ol className="relative space-y-8 md:sticky md:top-24 md:self-start">
            <span aria-hidden className="absolute left-[15px] top-2 bottom-2 w-px bg-white/10" />
            {["Install", "Configure", "Start"].map((s, i) => (
              <li key={s} className="relative flex items-start gap-4">
                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-cyan/40 bg-[color:var(--bg-elev)] mono text-xs font-semibold text-cyan">
                  {i + 1}
                </span>
                <div>
                  <div className="text-sm font-semibold">{s}</div>
                  <div className="mono text-[11px] text-muted-foreground">step {i + 1}</div>
                </div>
              </li>
            ))}
          </ol>

          <div className="space-y-10">
            {/* Step 1 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Step 1 — Install</h3>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[color:var(--bg-elev)] shadow-2xl shadow-black/40">
                <div className="flex items-center gap-1 border-b border-white/5 px-2">
                  {(["pip", "docker"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-4 py-2.5 mono text-xs transition ${
                        tab === t
                          ? "text-cyan border-b border-cyan"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <pre className="overflow-x-auto px-5 py-4 mono text-[13px] leading-relaxed text-foreground/90">
                  <code>
                    <TypedCode code={tab === "pip" ? pipCode : dockerCode} keySeed={tab} />
                  </code>
                </pre>
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Step 2 — Configure</h3>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[color:var(--bg-elev)]">
                <div className="border-b border-white/5 px-4 py-2 mono text-[11px] text-muted-foreground">
                  $ tollgate init
                </div>
                <div className="px-5 py-4 mono text-[12.5px] leading-relaxed text-foreground/90">
                  {wizard.map((line, i) => (
                    <div
                      key={i}
                      className="opacity-0"
                      style={{
                        animation: `tg-fade-line 0.35s ease-out ${i * 0.25}s forwards`,
                      }}
                    >
                      <span className={line.startsWith("✓") ? "text-emerald" : line.startsWith("›") ? "text-cyan" : "text-foreground/80"}>
                        {line}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <style>{`@keyframes tg-fade-line { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }`}</style>
            </div>

            {/* Step 3 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Step 3 — Start</h3>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[color:var(--bg-elev)]">
                <pre className="overflow-x-auto px-5 py-4 mono text-[13px] leading-relaxed text-foreground/90 whitespace-pre">
                  <code>{startCode}</code>
                </pre>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Then call it like any OpenAI-compatible API:
              </p>
              <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-[color:var(--bg-elev)]">
                <div className="border-b border-white/5 px-4 py-2 mono text-[11px] text-muted-foreground">python</div>
                <pre className="overflow-x-auto px-5 py-4 mono text-[13px] leading-relaxed">
                  <code>
                    {usageCode.split("\n").map((line, i) => (
                      <div key={i}>{colorLine(line)}</div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function colorLine(line: string) {
  // very light token highlighting for the python snippet
  const parts: React.ReactNode[] = [];
  const rx = /("[^"]*"|#.*$|\b(from|import|print)\b|\b(client|resp)\b)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = rx.exec(line))) {
    if (m.index > last) parts.push(<span key={idx++} className="text-foreground/90">{line.slice(last, m.index)}</span>);
    const tok = m[0];
    let cls = "text-foreground/90";
    if (tok.startsWith('"')) cls = "text-emerald";
    else if (tok.startsWith("#")) cls = "text-muted-foreground";
    else if (["from", "import", "print"].includes(tok)) cls = "text-violet";
    else if (["client", "resp"].includes(tok)) cls = "text-cyan";
    parts.push(<span key={idx++} className={cls}>{tok}</span>);
    last = m.index + tok.length;
  }
  if (last < line.length) parts.push(<span key={idx++} className="text-foreground/90">{line.slice(last)}</span>);
  return parts.length ? parts : "\u00A0";
}
