import http from 'node:http';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import { buildBlog, root } from './build-blog.mjs';

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.gif': 'image/gif', '.mp4': 'video/mp4', '.jpg': 'image/jpeg' };
const publishedOnly = process.argv.includes('--public');
let build = publishedOnly ? Promise.resolve() : Promise.resolve(await buildBlog({ preview: true }));
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname.includes('\\') || pathname.split('/').some((part) => part.startsWith('.')) || /^\/(?:content|scripts|node_modules)(?:\/|$)/.test(pathname)) {
      response.writeHead(404).end('Not found');
      return;
    }
    if (!publishedOnly && pathname.startsWith('/blog/')) {
      build = build.catch(() => {}).then(() => buildBlog({ preview: true }));
      await build;
    }
    const isPreview = !publishedOnly && (pathname.startsWith('/blog/') || pathname === '/data/blog-status.json');
    const base = isPreview ? path.join(root, '.blog-preview') : root;
    let filename = path.resolve(base, `.${pathname}`);
    if (!filename.startsWith(base + path.sep) && filename !== base) {
      response.writeHead(404).end('Not found');
      return;
    }
    if ((await stat(filename)).isDirectory()) {
      if (!pathname.endsWith('/')) {
        response.writeHead(302, { Location: pathname + '/' }).end();
        return;
      }
      filename = path.join(filename, 'index.html');
    }
    const contents = await readFile(filename);
    response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
    response.end(contents);
  } catch (error) {
    const notFound = error.code === 'ENOENT' || error.code === 'ENOTDIR';
    response.writeHead(notFound ? 404 : 500, { 'Content-Type': 'text/plain' });
    response.end(notFound ? 'Not found' : `Preview build error: ${error.message}`);
    if (!notFound) console.error(error);
  }
});

let port = Number(process.env.PORT || 4174);
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') server.listen(++port, '127.0.0.1');
  else { console.error(error); process.exitCode = 1; }
});
server.on('listening', () => console.log(`Blog ${publishedOnly ? 'published-only' : 'sample and draft'} preview: http://localhost:${port}/blog/\nWork: http://localhost:${port}/\n${publishedOnly ? 'Run npm run build:blog after editing published Markdown, then refresh.' : 'Refresh after editing Markdown.'} Press Ctrl+C to stop.`));
server.listen(port, '127.0.0.1');
