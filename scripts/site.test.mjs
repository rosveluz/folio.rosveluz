import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { buildSite } from './build-site.mjs';
import { root } from './build-blog.mjs';

test('site build produces linked HTML project and contact pages with unique metadata and a sitemap', async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), 'rosveluz-site-test-'));
  try {
    await writeFile(path.join(fixture, 'index.html'), await readFile(path.join(root, 'index.html'), 'utf8'));
    const project = {
      id: 'sample-project', title: 'Brand & Web', description: 'A project with <clear> details.',
      category: 'Web Design', date: '2026-01-01', detail: 'Responsive layouts',
      cover: 'img/cover.webp', images: [{ desktopSrc: 'img/example.webp', caption: 'Design & layout' }],
    };
    const { urls } = await buildSite({ projectRoot: fixture, portfolio: [project], includeBlog: false });
    const home = await readFile(path.join(fixture, 'index.html'), 'utf8');
    assert.match(home, /href="\/work\/sample-project\/"/);
    const page = await readFile(path.join(fixture, 'work', project.id, 'index.html'), 'utf8');
    assert.match(page, /<title>Brand &amp; Web \| Ros Veluz<\/title>/);
    assert.match(page, /<h1[^>]*>Brand &amp; Web<\/h1>/);
    assert.match(page, /A project with &lt;clear&gt; details\./);
    assert.match(page, /src="\/img\/example.webp"/);
    assert.match(page, /rel="canonical" href="https:\/\/folio.rosveluz.com\/work\/sample-project\/"/);
    assert.match(page, /src="\/script.js\?v=contact-2"/);
    assert.match(page, /href="\/styles.css\?v=contact-2"/);
    assert.equal((page.match(/rel="canonical"/g) || []).length, 1);
    const contact = await readFile(path.join(fixture, 'contact', 'index.html'), 'utf8');
    assert.match(contact, /mailto:hello@rosveluz.com/);
    assert.match(contact, /<title>Contact Ros Veluz/);
    const sitemap = await readFile(path.join(fixture, 'sitemap.xml'), 'utf8');
    for (const url of urls) assert.ok(sitemap.includes(`<loc>https://folio.rosveluz.com${url}</loc>`));
    assert.doesNotMatch(sitemap, /#/);
    await assert.rejects(buildSite({ projectRoot: fixture, portfolio: [project, project], includeBlog: false }), /duplicate/);
    await assert.rejects(buildSite({ projectRoot: fixture, portfolio: [{ ...project, id: '../escape' }], includeBlog: false }), /Invalid/);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test('routing forwards legacy links and renders real project and contact paths', async () => {
  const source = await readFile(path.join(root, 'script.js'), 'utf8');
  const route = source.slice(source.indexOf('function route()'));
  for (const [hash, pathname, expected] of [
    ['#work/sample-project', '/', '/work/sample-project/'],
    ['#contact', '/', '/contact/'],
    ['', '/work/sample-project/', 'sample-project'],
    ['', '/contact/', 'contact'],
    ['', '/', 'home'],
  ]) {
    let result;
    vm.runInNewContext(route, {
      window: { location: { hash, pathname, replace(url) { result = url; } } },
      currentFilter: 'All', openProject(id, update) { assert.equal(update, false); result = id; },
      renderContact() { result = 'contact'; }, renderHome() { result = 'home'; },
    });
    assert.equal(result, expected);
  }
});
