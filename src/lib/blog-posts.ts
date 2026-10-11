export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  coverImage?: string;
  content: string;
};

const files = import.meta.glob("../../content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function parseFrontmatter(source: string) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { fields: {} as Record<string, string>, content: source };

  const fields: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([\w-]+):\s*(.*)$/);
    if (field) fields[field[1]] = field[2].trim().replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, "$1$2");
  }
  return { fields, content: source.slice(match[0].length) };
}

function fileSlug(path: string) {
  return path.split("/").at(-1)?.replace(/\.md$/, "") ?? "";
}

function parsePost(path: string, source: string): BlogPost {
  const { fields, content } = parseFrontmatter(source);
  const slug = fields.slug || fileSlug(path);
  const coverImage = fields.coverImage || fields.image;
  return {
    slug,
    title: fields.title || slug.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    description: fields.description || fields.excerpt || "",
    date: fields.date || fields.publishedAt || "",
    category: fields.category || "Update",
    ...(coverImage ? { coverImage } : {}),
    content: content.trim(),
  };
}

export const blogPosts = Object.entries(files)
  .map(([path, source]) => parsePost(path, source))
  .sort((a, b) => b.date.localeCompare(a.date));

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function formatPostDate(date: string) {
  if (!date) return "";
  const value = new Date(`${date.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(value.valueOf())) return date;
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(value);
}
