import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { stringify } from 'yaml';
import { parsePost, renderMarkdown } from './blog-content.mjs';
import { buildBlog } from './build-blog.mjs';

const metadata = {
  title: 'Article title', slug: 'article-title', date: '2026-10-07', category: 'Design',
  excerpt: 'A short introduction', cover: '/img/cover.webp', coverAlt: 'A design', status: 'draft',
};
const source = (data, body = '## Context\n\nContent.\n\n## Result\n\nMore content.') => `---\n${stringify(data)}---\n${body}`;

test('front matter validates required fields, dates, slugs, and publication states', () => {
  assert.equal(parsePost(source(metadata), 'test.md').title, metadata.title);
  assert.throws(() => parsePost(source({ ...metadata, slug: '../escape' }), 'test.md'), /slug/);
  assert.throws(() => parsePost(source({ ...metadata, date: '2026-02-30' }), 'test.md'), /date/);
  assert.throws(() => parsePost(source({ ...metadata, status: 'public' }), 'test.md'), /status/);
  assert.throws(() => parsePost(source({ ...metadata, coverAlt: '' }), 'test.md'), /coverAlt/);
});

test('Markdown supports headings, unique contents IDs, figures, captions, lists, and code', () => {
  const result = renderMarkdown('## Context\n\nText with **bold**.\n\n## Context\n\n- One\n- Two\n\n![Design](/img/cover.webp "full: A caption.")\n\n```js\nconst value = 1;\n```');
  assert.deepEqual(result.sections.map((section) => section.id), ['context', 'context-2']);
  assert.match(result.html, /class="article-media is-full"/);
  assert.match(result.html, /<figcaption>A caption\.<\/figcaption>/);
  assert.doesNotMatch(result.html, /<p><figure/);
  assert.match(result.html, /<ul>/);
  assert.match(result.html, /language-js/);
  assert.equal(result.readingTime, '1 min read');
});

test('raw HTML and unsafe Markdown URLs cannot execute', () => {
  assert.match(renderMarkdown('<script>alert(1)</script>').html, /&lt;script&gt;/);
  assert.throws(() => renderMarkdown('[Bad](javascript:alert%281%29)'), /URL/);
  assert.throws(() => renderMarkdown('![Bad](data:image/png;base64,AAAA)'), /URL/);
  assert.throws(() => renderMarkdown('# Duplicate title'), /H1/);
});

test('production excludes samples and drafts, adds metadata, enables Blog, and removes unpublished output', async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), 'rosveluz-blog-test-'));
  try {
    const content = path.join(fixture, 'content', 'blog');
    await mkdir(path.join(content, '_samples'), { recursive: true });
    await mkdir(path.join(fixture, 'img'));
    await writeFile(path.join(fixture, 'img', 'cover.webp'), 'asset fixture');
    await writeFile(path.join(fixture, 'index.html'), '<footer class="site-footer"><span data-blog-link aria-disabled="true">Blog</span><span>About</span></footer>');
    await writeFile(path.join(content, 'published.md'), source({ ...metadata, status: 'published' }));
    await writeFile(path.join(content, 'draft.md'), source({ ...metadata, slug: 'draft-post' }));
    await writeFile(path.join(content, '_samples', 'sample.md'), source({ ...metadata, slug: 'sample-post', status: 'sample' }));
    const production = await buildBlog({ projectRoot: fixture });
    assert.equal(production.posts.length, 1);
    const html = await readFile(path.join(fixture, 'blog', 'article-title', 'index.html'), 'utf8');
    assert.match(html, /BlogPosting/);
    assert.match(html, /rel="canonical"/);
    assert.match(html, /og:image/);
    assert.match(html, /href="\/blog\/">Blog/);
    assert.match(html, /class="blog-nav-link" href="\/about\/">About/);
    assert.match(html, /aria-controls="site-page-menu" data-page-menu-toggle>MENU<\/button>/);
    assert.match(html, /id="site-page-menu" aria-label="Page navigation" hidden/);
    for (const [url, label] of [['/', 'Home'], ['/about/', 'About'], ['/service/', 'Services'], ['/blog/', 'Blog'], ['/contact/', 'Contact']]) {
      assert.ok(html.includes(`<a href="${url}">${label}</a>`));
    }
    assert.doesNotMatch(html, /noindex/);
    const preview = await buildBlog({ projectRoot: fixture, preview: true });
    assert.equal(preview.posts.length, 3);
    const sampleHtml = await readFile(path.join(fixture, '.blog-preview', 'blog', 'sample-post', 'index.html'), 'utf8');
    assert.match(sampleHtml, /noindex, nofollow/);
    await assert.rejects(access(path.join(fixture, 'blog', 'sample-post', 'index.html')));
    await assert.rejects(access(path.join(fixture, 'blog', 'draft-post', 'index.html')));
    await writeFile(path.join(content, 'published.md'), source(metadata));
    await buildBlog({ projectRoot: fixture });
    await assert.rejects(access(path.join(fixture, 'blog', 'article-title', 'index.html')));
    const index = await readFile(path.join(fixture, 'blog', 'index.html'), 'utf8');
    assert.match(index, /No articles published yet/);
    assert.match(index, /data-blog-link aria-disabled="true"/);
  } finally {
    // This directory was created by this test under the OS temporary directory.
    if (path.dirname(fixture) !== path.resolve(os.tmpdir()) || !path.basename(fixture).startsWith('rosveluz-blog-test-')) throw new Error('Invalid test cleanup path');
    await rm(fixture, { recursive: true, force: true });
  }
});
