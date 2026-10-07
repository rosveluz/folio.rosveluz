# Ros Veluz' Portfolio

A static portfolio site for Rosveluz, built with plain HTML, CSS, and JavaScript. The site is intended to run on GitHub Pages and can be previewed locally with VS Code Live Server.

## Project Structure

- `index.html` - Main page markup
- `styles.css` - Site layout, responsive styling, and component styles
- `script.js` - Portfolio routing, category filtering, sorting, and project detail interactions
- `data/projects.js` - Portfolio project data
- `about/` and `about.css` - About page and its layout
- `content/blog/` - Markdown articles
- `blog/` - Generated public blog pages
- `img/` - Logo, icon, and image assets

## Editing Portfolio Items

Portfolio items are managed in `data/projects.js`.

Each project can include:

- `id` - URL-safe project identifier
- `title` - Project title
- `detail` - Short project detail
- `category` - Category used for filtering
- `date` - Project date used for sorting and date filters
- `description` - Project copy shown on the detail view
- `cover` - Thumbnail image used on the folio grid
- `images` - Detail page images and captions

## Categories

Current categories:

- All
- Web Design
- UIUX
- Logo Design
- Graphics
- Desktop Publishing

Make sure project `category` values match these labels exactly.

## Local Preview

Open the folder in VS Code and use the Live Server extension to preview the site.

## GitHub Pages

This project is ready for GitHub Pages as a static site. In the repository settings, set GitHub Pages to serve from the branch and folder that contain `index.html`.

## Blog

See [BLOG-GUIDE.md](BLOG-GUIDE.md) for local previews, Markdown articles, and the publishing command. Run `npm run preview:blog` to preview articles and drafts locally, or `npm run build:blog` to generate published articles only.

## Publish Updates

Before committing changes to projects, blog content or templates, run:

```powershell
npm run build
npm test
```

Commit the page, style, script, article source, image, and configuration changes, including the generated `work/`, `contact/` and `blog/` pages, `sitemap.xml`, `robots.txt` and `data/blog-status.json`. Then push through the existing GitHub Pages workflow. The build command does not deploy the site.

Pages use `/about/`, `/service/`, `/contact/`, `/blog/` and `/work/<project-id>/`. Run `npm run build` after editing `data/projects.js` to regenerate project pages and the sitemap. Old `#work/...` and `#contact` links forward to their new pages. Preview the public output with `npm run preview:blog -- --public`. Local preview output and dependencies are excluded from Git; draft Markdown and build tools are excluded from the Pages site by `_config.yml`.
