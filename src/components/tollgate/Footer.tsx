import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <Logo />
        <nav className="flex flex-wrap items-center gap-6 mono text-xs text-muted-foreground">
          <a className="hover:text-foreground" href="https://github.com">GitHub</a>
          <a className="hover:text-foreground" href="#">Docs</a>
          <a className="hover:text-foreground" href="#">PyPI</a>
          <a className="hover:text-foreground" href="#">Docker Hub</a>
        </nav>
        <div className="mono text-xs text-muted-foreground">
          Built with <span className="text-cyan">♥</span> and Python.
        </div>
      </div>
    </footer>
  );
}
