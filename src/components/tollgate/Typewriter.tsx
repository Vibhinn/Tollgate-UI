import { useEffect, useState } from "react";

export function Typewriter({
  phrases,
  className = "",
}: {
  phrases: string[];
  className?: string;
}) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "hold" | "erasing">("typing");

  useEffect(() => {
    const current = phrases[i];
    let timeout: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (text.length < current.length) {
        timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), 55);
      } else {
        timeout = setTimeout(() => setPhase("hold"), 1400);
      }
    } else if (phase === "hold") {
      timeout = setTimeout(() => setPhase("erasing"), 400);
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), 25);
      } else {
        setI((n) => (n + 1) % phrases.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timeout);
  }, [text, phase, i, phrases]);

  return (
    <span className={className}>
      {text}
      <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-cyan animate-caret align-middle" />
    </span>
  );
}
