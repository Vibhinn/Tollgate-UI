import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 3, suffix: "", label: "providers" },
  { value: 1, suffix: "", label: "unified API" },
  { value: 5, suffix: "ms", prefix: "<", label: "routing overhead" },
  { value: 100, suffix: "%", label: "self-hosted" },
];

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

function Counter({ to }: { to: number }) {
  const [n, setN] = useState(0);
  const { ref, inView } = useInView<HTMLSpanElement>();
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{n}</span>;
}

export function Stats() {
  return (
    <section className="border-b border-white/5 py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="mono text-4xl font-semibold tracking-tight text-emerald md:text-5xl">
              {s.prefix}
              <Counter to={s.value} />
              {s.suffix}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
