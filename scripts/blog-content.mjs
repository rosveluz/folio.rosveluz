import { Marked } from 'marked';
import { parse as parseYaml } from 'yaml';

export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function safeUrl(value, image = false) {
  if (typeof value !== 'string' || /[\x00-\x20\\]/.test(value)) throw new Error(`Invalid URL: ${value}`);
  if (/^(?:https?:\/\/|\/(?!\/)|#)/i.test(value) || (!image && /^mailto:/i.test(value))) return value;
  throw new Error(`Use a root-relative or HTTPS URL: ${value}`);
}

export function parsePost(source, filename) {
  const match = source.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: missing YAML front matter`);
  const data = parseYaml(match[1]);
  for (const key of ['title', 'slug', 'date', 'category', 'excerpt', 'cover', 'coverAlt']) {
    if (typeof data?.[key] !== 'string' || !data[key].trim()) throw new Error(`${filename}: missing ${key}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) throw new Error(`${filename}: invalid slug`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || new Date(`${data.date}T00:00:00Z`).toISOString().slice(0, 10) !== data.date) {
    throw new Error(`${filename}: invalid publication date`);
  }
  if (!['draft', 'published', 'sample'].includes(data.status)) throw new Error(`${filename}: status must be draft, published, or sample`);
  safeUrl(data.cover, true);
  safeUrl(data.hero || data.cover, true);
  return { ...data, body: match[2], filename };
}

export function renderMarkdown(body) {
  const sections = [];
  const ids = new Map();
  const markdown = new Marked({ gfm: true, breaks: false, async: false });
  markdown.use({ renderer: {
    html(token) { return escapeHtml(token.text); },
    heading(token) {
      if (token.depth === 1) throw new Error('Article body headings start at ##; the title is already H1');
      const base = token.text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
      const count = (ids.get(base) || 0) + 1;
      ids.set(base, count);
      const id = count === 1 ? base : `${base}-${count}`;
      if (token.depth === 2) sections.push({ id, title: token.text });
      return `<h${token.depth} id="${id}">${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`;
    },
    link(token) {
      return `<a href="${escapeHtml(safeUrl(token.href))}"${token.title ? ` title="${escapeHtml(token.title)}"` : ''}>${this.parser.parseInline(token.tokens)}</a>`;
    },
    image(token) {
      const title = token.title || '';
      const treatment = title.match(/^(wide|full):\s*/);
      const caption = treatment ? title.slice(treatment[0].length) : title;
      return `<figure class="article-media${treatment ? ` is-${treatment[1]}` : ''}"><img src="${escapeHtml(safeUrl(token.href, true))}" alt="${escapeHtml(token.text)}" loading="lazy" decoding="async" />${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`;
    },
    paragraph(token) {
      const content = this.parser.parseInline(token.tokens);
      return token.tokens.length === 1 && token.tokens[0].type === 'image' ? `${content}\n` : `<p>${content}</p>\n`;
    },
  } });
  const html = markdown.parse(body);
  const words = body.replace(/```[\s\S]*?```/g, '').split(/\s+/).filter(Boolean).length;
  return { html, sections, readingTime: `${Math.max(1, Math.ceil(words / 200))} min read` };
}
