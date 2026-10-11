import type { ReactNode } from "react";

type ImageInfo = { alt: string; src: string; layout: string; width?: string };

function getImage(line: string): ImageInfo | undefined {
  const match = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\s*\{([^}]+)\})?$/);
  if (!match) return;
  const [, alt, src, rawOptions = ""] = match;
  const layoutValue = rawOptions.match(/layout\s*=\s*["'](full|center|left|right|half)["']/)?.[1] ?? "full";
  const widthValue = rawOptions.match(/width\s*=\s*["'](\d{1,3}%)["']/)?.[1];
  const width = widthValue && Number.parseInt(widthValue, 10) >= 20 && Number.parseInt(widthValue, 10) <= 100 ? widthValue : undefined;
  return { alt, src, layout: layoutValue, width };
}

function Inline({ text }: { text: string }) {
  const pieces = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
  return <>{pieces.map((piece, index) => {
    if (piece.startsWith("`") && piece.endsWith("`")) return <code key={index}>{piece.slice(1, -1)}</code>;
    if (piece.startsWith("**") && piece.endsWith("**")) return <strong key={index}>{piece.slice(2, -2)}</strong>;
    if (piece.startsWith("*") && piece.endsWith("*")) return <em key={index}>{piece.slice(1, -1)}</em>;
    const link = piece.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <a key={index} href={link[2]}>{link[1]}</a>;
    return piece;
  })}</>;
}

function resolveImage(src: string, slug: string) {
  if (/^(https?:|data:|\/)/.test(src)) return src;
  return `/blog/${slug}/${src.replace(/^\.\//, "")}`;
}

function Figure({ image, slug }: { image: ImageInfo; slug: string }) {
  return <figure className={`blog-image blog-image-${image.layout}`} style={image.width ? { width: image.width } : undefined}>
    <img src={resolveImage(image.src, slug)} alt={image.alt} loading="lazy" />
    {image.alt && <figcaption>{image.alt}</figcaption>}
  </figure>;
}

function CodeBlock({ source }: { source: string }) {
  return <pre className="blog-code"><code>{source}</code></pre>;
}

export function BlogMarkdown({ source, slug }: { source: string; slug: string }) {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim() === "---") { i++; continue; }

    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      blocks.push(<CodeBlock key={`code-${i}`} source={code.join("\n")} />);
      continue;
    }

    const image = getImage(line);
    if (image) {
      const images = [image];
      i++;
      while (i < lines.length) {
        const nextImage = getImage(lines[i]);
        if (!nextImage) break;
        images.push(nextImage);
        i++;
      }
      if (images.length > 1) {
        blocks.push(<div className="blog-image-grid" key={`images-${i}`}>{images.map((item, index) => <Figure key={index} image={{ alt: item.alt, src: item.src, layout: "half" }} slug={slug} />)}</div>);
      } else {
        blocks.push(<Figure key={`image-${i}`} image={image} slug={slug} />);
      }
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Tag = heading[1].length === 1 ? "h2" : "h3";
      blocks.push(<Tag key={`heading-${i}`}><Inline text={heading[2]} /></Tag>);
      i++;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const marker = ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/;
      const items: string[] = [];
      while (i < lines.length && marker.test(lines[i])) items.push(lines[i++].replace(marker, ""));
      const List = ordered ? "ol" : "ul";
      blocks.push(<List key={`list-${i}`}>{items.map((item, index) => <li key={index}><Inline text={item} /></li>)}</List>);
      continue;
    }

    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) quote.push(lines[i++].slice(2));
      blocks.push(<blockquote key={`quote-${i}`}>{quote.map((item, index) => <p key={index}><Inline text={item} /></p>)}</blockquote>);
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|```|\s*[-*]\s+|\s*\d+\.\s+|> )/.test(lines[i]) && !getImage(lines[i])) paragraph.push(lines[i++]);
    blocks.push(<p key={`paragraph-${i}`}><Inline text={paragraph.join(" ")} /></p>);
  }

  return <div className="blog-prose">{blocks}</div>;
}
