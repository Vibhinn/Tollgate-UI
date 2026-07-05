import { useEffect, useState } from "react";

export function TypedCode({ code, speed = 12, keySeed }: { code: string; speed?: number; keySeed?: string | number }) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setOut(code.slice(0, i));
      if (i >= code.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [code, speed, keySeed]);
  return (
    <>
      {out}
      <span className="ml-0.5 inline-block h-[1em] w-[7px] translate-y-[0.15em] bg-cyan/80 animate-caret align-middle" />
    </>
  );
}
