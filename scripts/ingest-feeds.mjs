// Heatt article ingestion.
//
// Direct outbound TLS is blocked in this sandbox, so feeds are fetched with the
// agent's page tool and dropped as raw text into scripts/feed-cache/<id>.xml.
// This script parses those cached feeds into structured, in-app article content
// and writes mobile/src/data/articles.json.
//
// For your real rights-cleared pipeline (running outside the sandbox), replace
// readCache() with a fetch() over each source.feedUrl and everything else works
// unchanged.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CACHE = path.join(__dirname, 'feed-cache');
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'mobile/src/data/blogCatalog.json'), 'utf8'));

const MAX_PER_SOURCE = 4;

// ---------- tiny XML / HTML helpers (no deps) ----------

function decodeEntities(s = '') {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”');
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decodeEntities(m[1].trim()) : '';
}

// Convert a chunk of post HTML into clean Markdown.
function htmlToMarkdown(html) {
  let s = html;
  // drop scripts/styles/iframes/forms
  s = s.replace(/<(script|style|form|noscript)[\s\S]*?<\/\1>/gi, '');
  s = s.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  // images
  s = s.replace(/<img[^>]*?src=["']([^"']+)["'][^>]*?>/gi, (_, src) => `\n\n![](${src})\n\n`);
  // links
  s = s.replace(/<a[^>]*?href=["']([^"']+)["'][^>]*?>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const clean = text.replace(/<[^>]+>/g, '').trim();
    if (!clean) return '';
    return `[${clean}](${href})`;
  });
  // headings
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, x) => `\n\n# ${strip(x)}\n\n`);
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, x) => `\n\n## ${strip(x)}\n\n`);
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, x) => `\n\n### ${strip(x)}\n\n`);
  s = s.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, x) => `\n\n#### ${strip(x)}\n\n`);
  // bold / italic
  s = s.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, x) => `**${strip(x)}**`);
  s = s.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, x) => `*${strip(x)}*`);
  // blockquote
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, x) => `\n\n> ${strip(x).replace(/\n+/g, ' ')}\n\n`);
  // list items
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, x) => `\n- ${strip(x).replace(/\n+/g, ' ')}`);
  s = s.replace(/<\/(ul|ol)>/gi, '\n\n');
  s = s.replace(/<(ul|ol)[^>]*>/gi, '\n');
  // hr
  s = s.replace(/<hr[^>]*>/gi, '\n\n---\n\n');
  // paragraphs & breaks
  s = s.replace(/<\/p>/gi, '\n\n');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  // strip remaining tags
  s = s.replace(/<[^>]+>/g, '');
  s = decodeEntities(s);
  // collapse whitespace
  s = s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return s;
}

function strip(x) {
  return decodeEntities(x.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function firstImage(html) {
  const m = html.match(/<img[^>]*?src=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

function readingMinutes(md) {
  const words = md.split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

// ---------- feed parsing ----------

function parseFeed(xml, source) {
  const articles = [];
  const isAtom = /<feed[\s>]/i.test(xml) && !/<rss[\s>]/i.test(xml);
  const itemRe = isAtom ? /<entry[\s>][\s\S]*?<\/entry>/gi : /<item[\s>][\s\S]*?<\/item>/gi;
  const items = xml.match(itemRe) || [];

  for (const item of items) {
    const title = strip(tag(item, 'title'));
    if (!title) continue;

    let link = '';
    if (isAtom) {
      const lm = item.match(/<link[^>]*href=["']([^"']+)["']/i);
      link = lm ? lm[1] : '';
    } else {
      link = tag(item, 'link');
    }

    const dateRaw = tag(item, 'pubDate') || tag(item, 'published') || tag(item, 'updated') || tag(item, 'dc:date');
    const date = dateRaw ? Date.parse(dateRaw) : Date.now();

    // author
    let author = strip(tag(item, 'dc:creator')) || strip(tag(item, 'creator'));
    if (!author && isAtom) {
      const am = item.match(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/i);
      author = am ? strip(am[1]) : '';
    }
    if (!author) author = source.name;

    // body: prefer content:encoded, then content, then description/summary
    const rawBody =
      tag(item, 'content:encoded') ||
      (isAtom ? tag(item, 'content') : '') ||
      tag(item, 'description') ||
      tag(item, 'summary') ||
      '';

    const md = htmlToMarkdown(rawBody);
    if (md.split(/\s+/).length < 40) continue; // skip stubs

    const cover = firstImage(rawBody);
    const excerptSource = md.replace(/[#>*_[\]]|\!\[\]\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
    const excerpt = excerptSource.slice(0, 180).trim() + (excerptSource.length > 180 ? '…' : '');

    articles.push({
      id: `${source.id}--${slug(title) || String(date)}`,
      sourceId: source.id,
      title,
      author,
      publishedAt: Number.isFinite(date) ? date : Date.now(),
      category: source.category,
      tags: source.tags,
      cover,
      excerpt,
      body: md,
      readingMinutes: readingMinutes(md),
      canonicalUrl: link, // kept for provenance only; the app never redirects here
    });
  }

  articles.sort((a, b) => b.publishedAt - a.publishedAt);
  return articles.slice(0, MAX_PER_SOURCE);
}

// ---------- main ----------

function readCache(id) {
  const p = path.join(CACHE, `${id}.xml`);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  return raw.trim().length > 0 ? raw : null;
}

const all = [];
let sourcesWithContent = 0;
const missing = [];

for (const source of catalog.sources) {
  const xml = readCache(source.id);
  if (!xml) { missing.push(source.id); continue; }
  try {
    const arts = parseFeed(xml, source);
    if (arts.length) { all.push(...arts); sourcesWithContent++; }
    else missing.push(source.id);
  } catch (e) {
    missing.push(source.id);
    console.error(`parse failed for ${source.id}: ${e.message}`);
  }
}

all.sort((a, b) => b.publishedAt - a.publishedAt);

const outPath = path.join(ROOT, 'mobile/src/data/articles.json');
fs.writeFileSync(outPath, JSON.stringify(all, null, 2));

console.log(`Sources with content: ${sourcesWithContent}/${catalog.sources.length}`);
console.log(`Total articles: ${all.length}`);
if (missing.length) console.log(`Missing cache: ${missing.join(', ')}`);
