# Writing a Tollgate blog post

Create a Markdown file in `content/blog/`. Its filename becomes the URL slug, so `release-1-2.md` is published at `/blog/release-1-2`.

Start each post with frontmatter:

```md
---
title: "Release 1.2"
description: "A short summary shown on the blog index."
date: "2026-10-11"
category: "Release"
coverImage: "/blog/release-1-2/cover.png"
---

Your post starts here. Use normal Markdown headings, links, lists, quotes, and fenced code blocks.
```

Put post images in `public/blog/<post-slug>/`. They are served from `/blog/<post-slug>/` and pushed with the post file.

Use standard Markdown for a full-width image:

```md
![Tollgate routing diagram](/blog/release-1-2/routing.png)
```

Add a layout option to align a smaller image:

```md
![Routing diagram](/blog/release-1-2/routing.png){layout="right" width="40%"}
```

Available layouts are `full` (default), `center`, `left`, `right`, and `half`. Consecutive image lines appear side by side automatically. Widths can be set from 20% to 100%; the layout remains responsive on phones.

Preview locally with the site dev server. Commit and push the Markdown and image files; they appear on the blog after the site deploys.
