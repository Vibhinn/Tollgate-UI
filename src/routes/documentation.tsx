import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import guide from "../../how_to_use.md?raw";

export const Route = createFileRoute("/documentation")({
  head: () => ({
    meta: [
      { title: "Documentation — Tollgate" },
      { name: "description", content: "Install, configure, and use Tollgate." },
    ],
  }),
  component: Documentation,
});

type GuideSection = { title: string; id: string; content: string[] };

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function splitGuide(source: string) {
  const lines = source.split("\n");
  const title = lines.find((line) => line.startsWith("# "))?.slice(2) ?? "Tollgate documentation";
  const firstSection = lines.findIndex((line) => line.startsWith("## "));
  const intro = lines.slice(lines.indexOf(`# ${title}`) + 1, firstSection).filter((line) => line.trim() !== "---");
  const sections: GuideSection[] = [];
  let current: GuideSection | undefined;

  for (const line of lines.slice(firstSection)) {
    if (line.startsWith("## ")) {
      const sectionTitle = line.slice(3).trim();
      current = { title: sectionTitle, id: slugify(sectionTitle.replace(/^\d+\.\s*/, "")), content: [] };
      sections.push(current);
    } else if (current) {
      current.content.push(line);
    }
  }

  return { title, intro, sections };
}

const parsedGuide = splitGuide(guide);

function Inline({ text }: { text: string }) {
  const fragments = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
  return <>{fragments.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <a key={index} href={link[2]}>{link[1]}</a>;
    return part;
  })}</>;
}

function Code({ children }: { children: string }) {
  const isYaml = /^services:\s*$/m.test(children);
  const isPython = /^(from |import )/.test(children.trim());
  const isTypeScript = /^import OpenAI/m.test(children);
  const commandWords = /^(docker|compose|pull|run|exec|start|stop|restart|logs|up|down|curl|git|clone|cd|python3|source|pip|install|tollgate|init|config|rm|host|lsof|kill|brew|sudo|apt)$/;
  const words = children.split("\n");

  return <pre className={`docs-code ${isYaml ? "docs-code-yaml" : "docs-code-shell"}`}><code>{words.map((line, index) => {
    let rendered;
    if (isYaml) {
      const pair = line.match(/^(\s*)([\w.-]+)(:)(.*)$/);
      if (pair) rendered = <>{pair[1]}<span className="docs-token-key">{pair[2]}</span>{pair[3]}<span className="docs-token-value">{pair[4]}</span></>;
      else if (/^\s*#/.test(line)) rendered = <span className="docs-token-comment">{line}</span>;
      else rendered = line;
    } else if (/^\s*#/.test(line)) {
      rendered = <span className="docs-token-comment">{line}</span>;
    } else {
      const tokens = line.split(/(\"[^\"]*\"|'[^']*'|--[\w-]+|-[a-zA-Z]+|https?:\/\/[^\s]+|ghcr\.io\/[^\s]+|[\w.-]+)/g);
      rendered = tokens.map((token, tokenIndex) => {
        if (/^(\"|').*(\"|')$/.test(token)) return <span className="docs-token-string" key={tokenIndex}>{token}</span>;
        if (/^--?[a-zA-Z]/.test(token)) return <span className="docs-token-flag" key={tokenIndex}>{token}</span>;
        if (/^(https?:\/\/|ghcr\.io\/)/.test(token)) return <span className="docs-token-value" key={tokenIndex}>{token}</span>;
        if (commandWords.test(token)) return <span className={isPython || isTypeScript ? "docs-token-key" : "docs-token-command"} key={tokenIndex}>{token}</span>;
        return token;
      });
    }
    return <span key={index}>{rendered}{index < words.length - 1 ? "\n" : null}</span>;
  })}</code></pre>;
}

function Markdown({ lines }: { lines: string[] }) {
  const blocks: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim() === "---") { i++; continue; }

    if (line.startsWith("```")) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) body.push(lines[i++]);
      i++;
      blocks.push(<Code key={`code-${i}`}>{body.join("\n")}</Code>);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const text = heading[2].replace(/\s+#+$/, "");
      const Tag = heading[1].length === 1 ? "h2" : "h3";
      blocks.push(<Tag key={`heading-${i}`}><Inline text={text} /></Tag>);
      i++;
      continue;
    }

    if (line.trimStart().startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trimStart().startsWith("|")) {
        const cells = lines[i].trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
        if (!cells.every((cell) => /^:?-{3,}:?$/.test(cell))) rows.push(cells);
        i++;
      }
      if (rows.length) blocks.push(<div className="docs-table-wrap" key={`table-${i}`}><table><thead><tr>{rows[0].map((cell, cellIndex) => <th key={cellIndex}><Inline text={cell} /></th>)}</tr></thead><tbody>{rows.slice(1).map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}><Inline text={cell} /></td>)}</tr>)}</tbody></table></div>);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      const pattern = ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/;
      while (i < lines.length && pattern.test(lines[i])) items.push(lines[i++].replace(pattern, ""));
      const List = ordered ? "ol" : "ul";
      blocks.push(<List className="docs-markdown-list" key={`list-${i}`}>{items.map((item, itemIndex) => <li key={itemIndex}><Inline text={item} /></li>)}</List>);
      continue;
    }

    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) quote.push(lines[i++].slice(2));
      blocks.push(<blockquote className="docs-markdown-quote" key={`quote-${i}`}>{quote.map((part, partIndex) => <p key={partIndex}><Inline text={part} /></p>)}</blockquote>);
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|```|\s*\||\s*[-*]\s+|\s*\d+\.\s+|> )/.test(lines[i])) paragraph.push(lines[i++]);
    blocks.push(<p key={`paragraph-${i}`}><Inline text={paragraph.join(" ").replace(/\s{2,}/g, " ")} /></p>);
  }
  return <>{blocks}</>;
}

function Documentation() {
  return <main className="site-shell docs-shell">
    <header className="site-nav"><a href="/#top" className="nav-wordmark" aria-label="Tollgate home"><span className="nav-symbol">╫</span> TOLLGATE<span className="nav-period">.</span></a><nav aria-label="Main navigation"><a href="/#benchmark">Benchmark</a><a href="/#how-it-works">How it works</a><a href="/#install">Install</a><a href="/blog">Blog</a></nav><a href="/#top" className="nav-action"><ArrowLeft size={15} /> BACK TO SITE</a></header>
    <div className="docs-layout">
      <aside className="docs-sidebar" aria-label="Documentation sections"><div className="docs-sidebar-label">GUIDE CONTENTS</div><nav>{parsedGuide.sections.map((section, index) => <a key={section.id} href={`#${section.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{section.title.replace(/^\d+\.\s*/, "")}</a>)}</nav></aside>
      <article className="docs-article">
        <header className="docs-heading" id="overview"><div className="eyebrow">TOLLGATE / DOCUMENTATION</div><h1>HOW TO USE<br/><span className="outline-title">TOLLGATE.</span></h1><Markdown lines={parsedGuide.intro} /></header>
        {parsedGuide.sections.map((section, index) => <section className="docs-section" id={section.id} key={section.id}><div className="docs-section-heading"><span>{String(index + 1).padStart(2, "0")} / GUIDE</span><h2>{section.title.replace(/^\d+\.\s*/, "")}</h2></div><Markdown lines={section.content} /></section>)}
        <section className="docs-section" id="back-to-site"><a className="docs-back-link" href="/#top">Back to Tollgate <ArrowUpRight size={16}/></a></section>
      </article>
    </div>
    <footer className="site-footer docs-footer"><div className="section-wrap"><a href="/#top" className="footer-logo">TOLLGATE<span>.</span></a><div><span>OPEN SOURCE. SELF-HOSTED. BUILT FOR THE WAY YOU SHIP.</span><a href="#overview">BACK TO TOP ↑</a></div></div></footer>
  </main>;
}
