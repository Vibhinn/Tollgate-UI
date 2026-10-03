import { useEffect, useMemo, useRef, useState } from "react";

type Provider = { key: "openai" | "anthropic" | "gemini"; label: string; color: string };
const providers: Provider[] = [
  { key: "openai", label: "OpenAI", color: "#10A37F" },
  { key: "anthropic", label: "Anthropic", color: "#D97757" },
  { key: "gemini", label: "Gemini", color: "#4285F4" },
];

type Particle = {
  id: number;
  phase: "in" | "think" | "out";
  provider: Provider;
  start: number;
};

export function NetworkGraph() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [thinking, setThinking] = useState(false);
  const nextId = useRef(0);

  useEffect(() => {
    let alive = true;
    const spawn = () => {
      if (!alive) return;
      const p: Particle = {
        id: nextId.current++,
        phase: "in",
        provider: providers[Math.floor(Math.random() * providers.length)],
        start: performance.now(),
      };
      setParticles((prev) => [...prev.slice(-8), p]);

      // Reaches gateway ~900ms in — "think"
      setTimeout(() => {
        setThinking(true);
        setParticles((prev) => prev.map((x) => (x.id === p.id ? { ...x, phase: "think" } : x)));
      }, 900);
      setTimeout(() => {
        setThinking(false);
        setParticles((prev) => prev.map((x) => (x.id === p.id ? { ...x, phase: "out" } : x)));
      }, 1300);
      setTimeout(() => {
        setParticles((prev) => prev.filter((x) => x.id !== p.id));
      }, 2600);
    };
    const iv = setInterval(spawn, 750);
    spawn();
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, []);

  // Geometry — viewBox based
  const w = 1000, h = 420;
  const app = { x: 90, y: h / 2 };
  const gate = { x: w / 2, y: h / 2 };
  const providerNodes = useMemo(
    () => ({
      openai: { x: w - 120, y: 90 },
      anthropic: { x: w - 120, y: h / 2 },
      gemini: { x: w - 120, y: h - 90 },
    }),
    [],
  );

  const pathIn = `M ${app.x} ${app.y} C ${app.x + 220} ${app.y - 40}, ${gate.x - 220} ${gate.y + 40}, ${gate.x} ${gate.y}`;
  const pathOut = (p: Provider) => {
    const target = providerNodes[p.key];
    const cx1 = gate.x + 180;
    const cy1 = gate.y;
    const cx2 = target.x - 180;
    const cy2 = target.y;
    return `M ${gate.x} ${gate.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${target.x} ${target.y}`;
  };

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[300px] md:h-[460px]" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="hex-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#10B981" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
          {providers.map((p) => (
            <radialGradient key={p.key} id={`glow-${p.key}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={p.color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={p.color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* Base paths */}
        <path d={pathIn} stroke="rgba(16,185,129,0.18)" strokeWidth={1.2} fill="none" />
        {providers.map((p) => (
          <path key={p.key} d={pathOut(p)} stroke={`${p.color}33`} strokeWidth={1.2} fill="none" />
        ))}

        {/* Your App node */}
        <g>
          <circle cx={app.x} cy={app.y} r={44} fill="url(#hex-glow)" />
          <circle cx={app.x} cy={app.y} r={22} fill="#0D1220" stroke="#10B981" strokeWidth={1.5} />
          <circle cx={app.x} cy={app.y} r={5} fill="#10B981" className="animate-breathe" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
          <text x={app.x} y={app.y + 60} textAnchor="middle" fill="#7C89A3" fontSize="12" fontFamily="Inter">
            Your App
          </text>
        </g>

        {/* Tollgate hexagon */}
        <g transform={`translate(${gate.x} ${gate.y})`}>
          <circle r={90} fill="url(#hex-glow)" className={thinking ? "animate-breathe" : ""} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
          <polygon
            points="-40,-23 0,-46 40,-23 40,23 0,46 -40,23"
            fill="#0D1220"
            stroke="#10B981"
            strokeWidth={1.8}
          />
          <polygon
            points="-26,-15 0,-30 26,-15 26,15 0,30 -26,15"
            fill="none"
            stroke="#10B981"
            strokeOpacity={thinking ? 0.9 : 0.4}
            strokeWidth={1}
          />
          <text y={4} textAnchor="middle" fill="#10B981" fontSize="11" fontFamily="JetBrains Mono" fontWeight={600}>
            TOLLGATE
          </text>
          <text y={72} textAnchor="middle" fill="#7C89A3" fontSize="12" fontFamily="Inter">
            {thinking ? "routing…" : "gateway"}
          </text>
        </g>

        {/* Provider nodes */}
        {providers.map((p) => {
          const n = providerNodes[p.key];
          return (
            <g key={p.key}>
              <circle cx={n.x} cy={n.y} r={38} fill={`url(#glow-${p.key})`} />
              <circle cx={n.x} cy={n.y} r={20} fill="#0D1220" stroke={p.color} strokeWidth={1.4} />
              <circle cx={n.x} cy={n.y} r={4} fill={p.color} />
              <text x={n.x} y={n.y + 42} textAnchor="middle" fill="#7C89A3" fontSize="12" fontFamily="Inter">
                {p.label}
              </text>
            </g>
          );
        })}

        {/* Particles */}
        {particles.map((p) => {
          const d = p.phase === "out" ? pathOut(p.provider) : pathIn;
          const color = p.phase === "out" ? p.provider.color : "#10B981";
          return (
            <circle key={p.id} r={p.phase === "think" ? 0 : 3.2} fill={color}>
              {p.phase !== "think" && (
                <animateMotion
                  dur={p.phase === "in" ? "0.9s" : "1.3s"}
                  fill="freeze"
                  path={d}
                  begin="0s"
                  rotate="auto"
                />
              )}
            </circle>
          );
        })}
      </svg>
    </div>
  );
}
