import { mkdir, readdir, readFile, writeFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { escapeHtml as esc, parsePost, renderMarkdown } from './blog-content.mjs';
import { renderInnerHeader } from './site-header.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://folio.rosveluz.com';
const intro = 'Notes on design, development, experiments, process, and things I find interesting.';
const dateLabel = (date) => new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
const articleUrl = (post) => `/blog/${post.slug}/`;

async function loadPosts(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch((error) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  const posts = [];
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      posts.push(parsePost(await readFile(path.join(directory, entry.name), 'utf8'), entry.name));
    }
  }
  return posts;
}

async function validateAssets(post, projectRoot) {
  for (const asset of [post.cover, post.hero, ...[...post.body.matchAll(/!\[[^\]]*\]\((\/[^\s)]+)/g)].map((match) => match[1])].filter(Boolean)) {
    if (asset.startsWith('/') && !asset.startsWith('//')) {
      const assetPath = path.resolve(projectRoot, `.${decodeURIComponent(asset)}`);
      const info = await stat(assetPath).catch(() => null);
      if (!assetPath.startsWith(projectRoot + path.sep) || !info?.isFile() || !info.size) {
        throw new Error(`${post.filename}: missing local image ${asset}`);
      }
    }
  }
}


function page({ title, description, url, image, content, footer, preview, post }) {
  const metadata = post ? `<meta property="article:published_time" content="${esc(post.date)}" />
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title,
      description: post.excerpt, datePublished: post.date, image: new URL(image, origin).href,
      author: { '@type': 'Person', name: 'Ros Veluz' }, mainEntityOfPage: origin + url,
    }).replace(/</g, '\\u003c')}</script>` : '';
  return `<!doctype html>
<html lang="en"><head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-9MT0GQPDPR"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-9MT0GQPDPR');
  </script>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/svg+xml" sizes="any" href="/img/favicon.svg?v=2" />
  <title>${esc(title)} | Rosveluz</title><meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${origin}${url}" />
  <meta property="og:title" content="${esc(title)}" /><meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${origin}${url}" /><meta property="og:type" content="${post ? 'article' : 'website'}" />
  ${image ? `<meta property="og:image" content="${esc(new URL(image, origin).href)}" /><meta property="og:image:alt" content="${esc(post?.heroAlt || post?.coverAlt || '')}" />` : ''}
  ${preview || post?.status === 'draft' ? '<meta name="robots" content="noindex, nofollow" />' : ''}
  ${metadata}
  <link rel="stylesheet" href="/styles.css?v=contact-2" /><link rel="stylesheet" href="/blog.css" />
  <script type="module" src="/blog.js"></script>
</head><body class="blog-page">
  <a class="skip-link" href="#blog-main">Skip to content</a>
  ${renderInnerHeader()}
  <main class="site-main blog-main" id="blog-main" tabindex="-1">${content}</main>
  ${footer}
</body></html>\n`;
}

function summary(post, featured = false) {
  return `<article class="${featured ? 'blog-featured' : 'blog-entry'}">
    <a class="blog-story-link" href="${articleUrl(post)}">
      <img class="blog-cover" src="${esc(post.cover)}" alt="${esc(post.coverAlt)}" ${featured ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />
      <div class="blog-summary">
        <p class="blog-meta">${featured ? '<span>Featured</span>' : `<span>${esc(post.category)}</span><time datetime="${post.date}">${dateLabel(post.date)}</time>`}</p>
        <h2>${esc(post.title)}</h2><p class="blog-excerpt">${esc(post.excerpt)}</p>
        ${featured ? `<p class="blog-meta"><time datetime="${post.date}">${dateLabel(post.date)}</time><span>${esc(post.readingTime)}</span></p>` : ''}
      </div>
    </a>
  </article>`;
}

function article(post, next) {
  return `<article class="blog-article">
    <header class="article-heading">
      <p class="blog-meta"><span>${esc(post.category)}</span><time datetime="${post.date}">${dateLabel(post.date)}</time></p>
      <h1>${esc(post.title)}</h1><p class="article-deck">${esc(post.excerpt)}</p><p class="blog-meta">${esc(post.readingTime)}</p>
    </header>
    <img class="article-hero" src="${esc(post.hero || post.cover)}" alt="${esc(post.heroAlt || post.coverAlt)}" fetchpriority="high" decoding="async" />
    <div class="article-layout ${post.sections.length > 1 ? '' : 'without-toc'}">
      ${post.sections.length > 1 ? `<aside class="article-toc"><nav aria-label="Article contents"><p class="blog-meta">Contents</p><ol>${post.sections.map((section) => `<li><a href="#${section.id}">${esc(section.title)}</a></li>`).join('')}</ol></nav></aside>` : ''}
      <div class="article-body">${post.html}</div>
    </div>
    ${next ? `<a class="article-next" href="${articleUrl(next)}"><span class="blog-meta">Next article</span><span class="article-next-title">${esc(next.title)}</span><img src="/img/Down%20Arrow.svg" alt="" /></a>` : '<a class="article-back" href="/blog/">Back to Blog</a>'}
  </article>`;
}

export async function buildBlog({ preview = false, projectRoot = root } = {}) {
  const root = path.resolve(projectRoot);
  const outputRoot = preview ? path.join(root, '.blog-preview') : root;
  const directory = path.join(root, 'content', 'blog');
  const allPosts = [...await loadPosts(directory), ...preview ? await loadPosts(path.join(directory, '_samples')) : []];
  const posts = allPosts.filter((post) => preview || post.status === 'published').sort((a, b) => b.date.localeCompare(a.date));
  const slugs = new Set();
  for (const post of posts) {
    if (slugs.has(post.slug)) throw new Error(`Duplicate blog slug: ${post.slug}`);
    slugs.add(post.slug);
    await validateAssets(post, root);
    Object.assign(post, renderMarkdown(post.body));
  }
  const published = allPosts.some((post) => post.status === 'published');
  const index = await readFile(path.join(root, 'index.html'), 'utf8');
  let footer = index.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)?.[0];
  if (!footer) throw new Error('Could not find the existing site footer');
  footer = footer.replace(/src="img\//g, 'src="/img/');
  if (published) footer = footer.replace('<span data-blog-link aria-disabled="true">Blog</span>', '<a href="/blog/">Blog</a>');
  const blogDirectory = path.join(outputRoot, 'blog');
  const oldManifest = JSON.parse(await readFile(path.join(outputRoot, 'data', 'blog-status.json'), 'utf8').catch(() => '{"slugs":[]}'));
  // Remove only article directories previously generated by this builder.
  for (const slug of oldManifest.slugs || []) {
    if (!slugs.has(slug) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      await rm(path.join(blogDirectory, slug, 'index.html'), { force: true });
    }
  }
  await mkdir(blogDirectory, { recursive: true });
  const featured = posts.find((post) => post.featured === true) || posts[0];
  const content = `<section class="blog-intro"><h1>Blog</h1><p>${intro}</p></section>
    ${posts.length ? `${summary(featured, true)}<section class="blog-grid" aria-label="Articles">${posts.filter((post) => post !== featured).map((post) => summary(post)).join('')}</section>` : '<p class="blog-empty">No articles published yet.</p>'}`;
  await writeFile(path.join(blogDirectory, 'index.html'), page({ title: 'Blog', description: intro, url: '/blog/', content, footer, preview }));
  for (const [index, post] of posts.entries()) {
    const directory = path.join(blogDirectory, post.slug);
    await mkdir(directory, { recursive: true });
    const next = posts.length > 1 ? posts[(index + 1) % posts.length] : null;
    await writeFile(path.join(directory, 'index.html'), page({ title: post.title, description: post.excerpt, url: articleUrl(post), image: post.hero || post.cover, content: article(post, next), footer, preview, post }));
  }
  await mkdir(path.join(outputRoot, 'data'), { recursive: true });
  await writeFile(path.join(outputRoot, 'data', 'blog-status.json'), JSON.stringify({ published, slugs: posts.map((post) => post.slug) }, null, 2) + '\n');
  return { posts, outputRoot };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { posts } = await buildBlog({ preview: process.argv.includes('--preview') });
  console.log(`Built ${posts.length} blog article(s).${posts.length === 0 ? ' Footer Blog link remains inactive.' : ''}`);
}
