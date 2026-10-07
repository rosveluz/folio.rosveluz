# Blog Guide

The portfolio stays plain HTML, CSS, and JavaScript. Blog pages are generated from Markdown so each article has its own URL and SEO metadata.

## Preview the Articles

In VS Code, choose **Terminal > New Terminal**. Make sure it opens in this project folder.

Run these commands one at a time:

```powershell
npm install
npm run preview:blog
```

The terminal prints the preview address, usually **http://localhost:4174/blog/**. Open that address to see the articles. If the port is busy, the preview uses the next available port.

Refresh the page after editing Markdown. Press **Ctrl+C** in the terminal to stop the preview.

The placeholder articles have been deleted. The preview output lives in `.blog-preview/`, which is excluded from Git. Draft articles are available only in this local preview. `_config.yml` excludes source Markdown and build tools from the GitHub Pages site.

The public footer's Blog link is active when at least one article has `status: published`. About links to `/about/`.

## Add an Article

1. Create a Markdown file in `content/blog/`, such as `my-first-article.md`. Keep it outside `_samples/`.
2. Add the metadata and body shown below.
3. Put article images in `img/blog/my-first-article/` and use their paths in the Markdown.
4. Start with `status: draft`, then preview using `npm run preview:blog`.

```markdown
---
title: "My First Article"
slug: "my-first-article"
date: "2026-10-07"
category: "Design / Process"
excerpt: "A short introduction to the article."
cover: "/img/blog/my-first-article/cover.webp"
coverAlt: "Describe what the cover image shows"
hero: "/img/blog/my-first-article/hero.webp"
heroAlt: "Describe what the hero image shows"
featured: true
status: draft
---

## Context

Write your introduction here.

## Process

Write about your decisions, examples, and observations.

![Describe the image](/img/blog/my-first-article/01.webp "An optional caption.")

## Result

Write your conclusion here.
```

`hero` and `heroAlt` are optional; the cover is used when they are absent. Reading time is calculated automatically. The newest featured article is used for the large index feature; if none is featured, the newest article is used.

Use `##` for main sections and `###` for subsections. Two or more main sections create a contents list automatically. Links to local pages and images must start with `/`, for example `/`. External links use full HTTPS URLs. Raw HTML is displayed as text rather than executed.

## Wider Images

Place images on their own line. Add a title after the image path to create a caption. Prefix it with `wide:` or `full:` to use the full article body-column width. Both treatments stay within the content column and leave the contents sidebar clear:

```markdown
![Dashboard design](/img/blog/my-first-article/02.webp "wide: A dashboard layout.")

![Desktop and mobile comparison](/img/blog/my-first-article/03.webp "full: Comparing two layouts.")
```

## Publish an Article

1. Finish the article and confirm its images, descriptions, title, and date in local preview.
2. Change `status: draft` to `status: published`.
3. In the terminal, run:

```powershell
npm run build
```

The command writes the public pages into `blog/` and updates `data/blog-status.json`. Only published articles are included. This also enables the footer Blog link when the site loads.

To review just the published pages locally, stop any existing preview with **Ctrl+C**, then run:

```powershell
npm run preview:blog -- --public
```

This serves the generated public build without samples or drafts. After changing a published article, run `npm run build` again and refresh the browser.

4. Review and commit the Markdown, article images, generated `blog/` pages, and `data/blog-status.json`, then push through your normal GitHub Pages workflow. The build command itself does not publish or push anything.

Run `npm run build` again whenever you change a published article, its status, or the shared blog templates. To unpublish, set its status back to `draft`, rebuild, and commit the updated generated files.

The article URL will be `https://folio.rosveluz.com/blog/my-first-article/`. Generated HTML includes the title, description, canonical URL, Open Graph metadata, and BlogPosting structured data.

## Troubleshooting

- `npm` is not recognized: install Node.js, then reopen the VS Code terminal.
- The build reports a missing image: confirm the file exists at the path in the metadata or Markdown.
- The build reports missing metadata: compare the first block with the example above.
- Drafts do not show with Live Server: use `npm run preview:blog` for the local draft preview. Live Server shows the public build.
- An article is absent from the public build: confirm it is outside `_samples/` and has `status: published`.

Content validation happens before pages are written. Fix any reported issue and run the command again.
