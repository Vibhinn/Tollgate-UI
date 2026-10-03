import { Github, Star } from "lucide-react";
import { Logo } from "./Logo";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[color:var(--bg-base)]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition hover:text-foreground">Features</a>
          <a href="#routing" className="text-sm text-muted-foreground transition hover:text-foreground">Routing</a>
          <a href="#install" className="text-sm text-muted-foreground transition hover:text-foreground">Install</a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            className="hidden items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-foreground/90 transition hover:border-emerald/40 hover:bg-white/[0.07] sm:flex"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
            <span className="flex items-center gap-1 rounded border border-white/10 bg-black/40 px-1.5 py-0.5 mono text-[10px] text-emerald">
              <Star className="h-3 w-3 fill-emerald text-emerald" /> 2.4k
            </span>
          </a>
          <a
            href="#install"
            className="rounded-md border border-emerald/40 bg-emerald/10 px-4 py-1.5 text-sm font-medium text-emerald transition hover:bg-emerald hover:text-[color:var(--primary-foreground)]"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}
