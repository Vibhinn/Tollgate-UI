import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { blogPosts, formatPostDate } from "@/lib/blog-posts";

export const Route = createFileRoute("/blog/")({
  head: () => ({ meta: [{ title: "Blog — Tollgate" }, { name: "description", content: "Product releases, updates, and notes from Tollgate." }] }),
  component: BlogIndex,
});

function BlogIndex() {
  return <main className="site-shell blog-shell">
    <header className="site-nav">
      <a href="/#top" className="nav-wordmark" aria-label="Tollgate home"><span className="nav-symbol">╫</span> TOLLGATE<span className="nav-period">.</span></a>
      <nav aria-label="Main navigation"><a href="/#benchmark">Benchmark</a><a href="/documentation">Documentation</a></nav>
      <a href="/#top" className="nav-action"><ArrowLeft size={15} /> BACK TO SITE</a>
    </header>
    <section className="blog-index-hero">
      <div className="eyebrow">TOLLGATE / JOURNAL</div>
      <h1>RELEASES.<br/><span className="outline-title">FIELD NOTES.</span></h1>
      <p>Product releases, engineering notes, and updates from the Tollgate project.</p>
    </section>
    <section className="blog-list" aria-label="Blog posts">
      {blogPosts.length ? <div className="blog-card-grid">{blogPosts.map((post) => <Link key={post.slug} to="/blog/$slug" params={{ slug: post.slug }} className="blog-card">
        {post.coverImage ? <img className="blog-card-image" src={post.coverImage} alt="" loading="lazy" /> : <div className="blog-card-placeholder" aria-hidden="true"><span>╫</span></div>}
        <div className="blog-card-meta"><span>{post.category}</span><time dateTime={post.date}>{formatPostDate(post.date)}</time></div>
        <h2>{post.title}</h2>
        {post.description && <p>{post.description}</p>}
        <span className="blog-read-link">READ ARTICLE <ArrowRight size={15}/></span>
      </Link>)}</div> : <div className="blog-empty"><span className="eyebrow">NO POSTS YET</span><p>New releases and notes will appear here. Add a Markdown post under <code>content/blog/</code> to get started.</p></div>}
    </section>
    <footer className="site-footer blog-footer"><div className="section-wrap"><a href="/#top" className="footer-logo">TOLLGATE<span>.</span></a><div><span>OPEN SOURCE. SELF-HOSTED. BUILT FOR THE WAY YOU SHIP.</span><a href="#top">BACK TO TOP ↑</a></div></div></footer>
  </main>;
}
