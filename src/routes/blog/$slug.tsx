import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { BlogMarkdown } from "@/components/blog/BlogMarkdown";
import { formatPostDate, getBlogPost } from "@/lib/blog-posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => getBlogPost(params.slug),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `${loaderData.title} — Tollgate` : "Tollgate Blog" }] }),
  component: BlogArticle,
});

function BlogArticle() {
  const post = Route.useLoaderData();

  if (!post) {
    return <main className="site-shell blog-shell"><div className="blog-not-found"><div className="eyebrow">404 / ARTICLE NOT FOUND</div><h1>THIS POST<br/><span className="outline-title">ISN’T HERE.</span></h1><Link to="/blog" className="docs-back-link">Back to the blog <ArrowUpRight size={16}/></Link></div></main>;
  }

  return <main className="site-shell blog-shell">
    <header className="site-nav">
      <a href="/#top" className="nav-wordmark" aria-label="Tollgate home"><span className="nav-symbol">╫</span> TOLLGATE<span className="nav-period">.</span></a>
      <nav aria-label="Main navigation"><Link to="/blog">Blog</Link><a href="/documentation">Documentation</a></nav>
      <Link to="/blog" className="nav-action"><ArrowLeft size={15}/> ALL POSTS</Link>
    </header>
    <article className="blog-article">
      <header className="blog-article-header">
        <div className="eyebrow">{post.category} / {formatPostDate(post.date)}</div>
        <h1>{post.title}</h1>
        {post.description && <p className="blog-description">{post.description}</p>}
        {post.coverImage && <img className="blog-cover" src={post.coverImage} alt="" />}
      </header>
      <BlogMarkdown source={post.content} slug={post.slug}/>
      <footer className="blog-article-footer"><Link to="/blog" className="docs-back-link"><ArrowLeft size={16}/> Back to all posts</Link></footer>
    </article>
    <footer className="site-footer blog-footer"><div className="section-wrap"><a href="/#top" className="footer-logo">TOLLGATE<span>.</span></a><div><span>OPEN SOURCE. SELF-HOSTED. BUILT FOR THE WAY YOU SHIP.</span><a href="#top">BACK TO TOP ↑</a></div></div></footer>
  </main>;
}
