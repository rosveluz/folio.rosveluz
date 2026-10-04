# PermitEdge integration

Five UIUX entries are added at the start of data/projects.js. Each uses cover 01 and four desktop/mobile image pairs. Original placeholder projects are retained. Assets are in img/projects/permitedge, optimized as WebP at their original dimensions.

The mobile carousel now uses natural image proportions so the 900 × 1200 portfolio compositions are not cropped into the previous 4:5 frame.

The date 2026-10-01 is a provisional portfolio listing date based on export date, not a claim about when the work was completed. Change it in data/projects.js if you prefer the actual design date.

## Review locally
Open this folder in VS Code and run Live Server. Select UIUX and open each PermitEdge item. Review at desktop and phone widths.

## Publish to your existing GitHub Pages repository
Copy data/projects.js, styles.css, and img/projects/permitedge/ into the repository root, commit, and push to the publishing branch. No DNS change is required. Keep the existing repository settings and CNAME.

Do not nest the folio.rosveluz-main folder inside the repository; copy its contents into the existing root.
