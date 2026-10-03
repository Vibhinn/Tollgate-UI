export function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="/" className={`flex items-center gap-2.5 ${className}`}>
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden>
        <defs>
          <linearGradient id="tg-lg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#10B981" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <rect x="3" y="13" width="26" height="4" rx="1" fill="url(#tg-lg)" />
        <rect x="5" y="4" width="3" height="24" rx="1" fill="#10B981" />
        <rect x="24" y="4" width="3" height="24" rx="1" fill="#10B981" />
        <circle cx="16" cy="15" r="2.4" fill="#10B981" className="animate-breathe origin-center" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight">
        Tollgate
      </span>
    </a>
  );
}
