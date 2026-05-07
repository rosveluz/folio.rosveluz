# Rosveluz Portfolio

A static portfolio site for Rosveluz, built with plain HTML, CSS, and JavaScript. The site is intended to run on GitHub Pages and can be previewed locally with VS Code Live Server.

## Project Structure

- `index.html` - Main page markup
- `styles.css` - Site layout, responsive styling, and component styles
- `script.js` - Portfolio routing, category filtering, sorting, and project detail interactions
- `data/projects.js` - Portfolio project data
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
