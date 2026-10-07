import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects } from '../data/projects.js';
import { escapeHtml as esc, renderCards, renderProject, renderContactContent } from '../portfolio-render.js';
import { buildBlog, root } from './build-blog.mjs';
import { renderInnerHeader } from './site-header.mjs';

const origin = 'https://folio.rosveluz.com';

export async function buildSite({ projectRoot = root, portfolio = projects, includeBlog = true } = {}) {
  const template = await readFile(path.join(projectRoot, 'index.html'), 'utf8');
  const ids = new Set();
  for (const project of portfolio) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id) || ids.has(project.id)) {
      throw new Error(`Invalid or duplicate project id: ${project.id}`);
    }
    ids.add(project.id);
  }
  if (!template.includes('<!-- seo:start -->') || !template.includes('id="app"')) {
    throw new Error('Homepage is missing its SEO or main content markers');
  }

  function page({ title, description, url, className, content, image }) {
    const metadata = `<!-- seo:start -->
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${origin}${url}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${origin}${url}" />
    <meta property="og:type" content="website" />
    ${image ? `<meta property="og:image" content="${esc(new URL(image, origin + '/').href)}" />` : ''}
    <!-- seo:end -->`;
    return template
      .replace(/<header class="site-header[^"]*" data-header>[\s\S]*?<\/header>/, (header) => url === '/' ? header : renderInnerHeader())
      .replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, metadata)
      .replace(/<main id="app"[\s\S]*?<\/main>/, `<main id="app" class="site-main ${className}" tabindex="-1">${content}</main>`)
      .replaceAll('src="img/', 'src="/img/')
      .replace(/[ \t]+$/gm, '');
  }
  const urls = ['/', '/about/', '/service/', '/contact/'];
  await writeFile(path.join(projectRoot, 'index.html'), page({
    title: 'Ros Veluz | Web, UI/UX & Graphic Design Portfolio',
    description: "Explore Ros Veluz's portfolio of web design, UI/UX, branding, graphics and desktop publishing projects.",
    url: '/', className: 'home-view',
    content: `<h1 class="visually-hidden">Ros Veluz design portfolio</h1><section class="work-grid" aria-label="Portfolio work">${renderCards([...portfolio].sort((a, b) => b.date.localeCompare(a.date)))}</section>`,
  }));
  for (const project of portfolio) {
    const url = `/work/${project.id}/`;
    urls.push(url);
    const directory = path.join(projectRoot, 'work', project.id);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'index.html'), page({
      title: `${project.title} | Ros Veluz`, description: project.description,
      url, image: project.cover, className: 'detail-view', content: renderProject(project),
    }));
  }
  await mkdir(path.join(projectRoot, 'contact'), { recursive: true });
  await writeFile(path.join(projectRoot, 'contact', 'index.html'), page({
    title: 'Contact Ros Veluz | Design Enquiries',
    description: 'Get in touch with Ros Veluz to discuss web, UI/UX, graphic design and publication projects.',
    url: '/contact/', className: 'contact-view', content: renderContactContent(),
  }));
  if (includeBlog) await buildBlog({ projectRoot });
  const blog = JSON.parse(await readFile(path.join(projectRoot, 'data', 'blog-status.json'), 'utf8').catch(() => '{"slugs":[]}'));
  urls.push('/blog/', ...blog.slugs.map((slug) => `/blog/${slug}/`));
  await writeFile(path.join(projectRoot, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${origin}${url}</loc></url>`).join('\n')}\n</urlset>\n`);
  await writeFile(path.join(projectRoot, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
  return { urls };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { urls } = await buildSite();
  console.log(`Built site with ${urls.length} crawlable URLs.`);
}
