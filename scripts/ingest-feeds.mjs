// Heatt article ingestion.
//
// Direct outbound TLS is blocked in this sandbox, so feeds are fetched with the
// agent's page tool and dropped into scripts/feed-cache/<id>.(md|xml).
//
//  - <id>.md  : CLEANED text as returned by the page-fetch tool (WordPress feeds
//               come back as readable markdown with the raw XML tags stripped).
//  - <id>.xml : RAW RSS/Atom XML (what a real fetch() over source.feedUrl gives).
//
// This script parses whichever is present into structured, in-app article
// content and writes mobile/src/data/articles.json.
//
// For your real rights-cleared pipeline (running outside the sandbox), fetch()
// each source.feedUrl, save the body as <id>.xml, and re-run: the XML path below
// handles it unchanged.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CACHE = path.join(__dirname, 'feed-cache');
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'mobile/src/data/blogCatalog.json'), 'utf8'));

const MAX_PER_SOURCE = 4;
const MIN_WORDS = 120; // full articles only — skip stubs/excerpts

// ---------- shared helpers ----------

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

function strip(x) {
  return decodeEntities(String(x).replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function readingMinutes(md) {
  const words = md.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

function firstImage(html) {
  const m = html.match(/<img[^>]*?src=["']([^"']+)["']/i) || html.match(/!\[[^\]]*\]\(([^)\s]+)/);
  return m ? m[1] : '';
}

function excerptOf(md) {
  const src = md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return src.slice(0, 180).trim() + (src.length > 180 ? '…' : '');
}

function mkArticle(source, { title, link, date, author, bodyMd }) {
  const md = bodyMd.trim();
  return {
    id: `${source.id}--${slug(title) || String(date)}`,
    sourceId: source.id,
    title,
    author: author || source.name,
    publishedAt: Number.isFinite(date) ? date : Date.now(),
    category: source.category,
    tags: source.tags,
    cover: firstImage(bodyMd),
    excerpt: excerptOf(md),
    body: md,
    readingMinutes: readingMinutes(md),
    canonicalUrl: link || source.url, // provenance only — the app never redirects here
  };
}

// ---------- RAW XML parser (RSS + Atom) ----------

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decodeEntities(m[1].trim()) : '';
}

function htmlToMarkdown(html) {
  let s = html;
  s = s.replace(/<(script|style|form|noscript)[\s\S]*?<\/\1>/gi, '');
  s = s.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  s = s.replace(/<img[^>]*?src=["']([^"']+)["'][^>]*?>/gi, (_, src) => `\n\n![](${src})\n\n`);
  s = s.replace(/<a[^>]*?href=["']([^"']+)["'][^>]*?>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const clean = text.replace(/<[^>]+>/g, '').trim();
    if (!clean) return '';
    return `[${clean}](${href})`;
  });
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, x) => `\n\n# ${strip(x)}\n\n`);
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, x) => `\n\n## ${strip(x)}\n\n`);
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, x) => `\n\n### ${strip(x)}\n\n`);
  s = s.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, x) => `\n\n#### ${strip(x)}\n\n`);
  s = s.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, x) => `**${strip(x)}**`);
  s = s.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, x) => `*${strip(x)}*`);
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, x) => `\n\n> ${strip(x).replace(/\n+/g, ' ')}\n\n`);
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, x) => `\n- ${strip(x).replace(/\n+/g, ' ')}`);
  s = s.replace(/<\/(ul|ol)>/gi, '\n\n');
  s = s.replace(/<(ul|ol)[^>]*>/gi, '\n');
  s = s.replace(/<hr[^>]*>/gi, '\n\n---\n\n');
  s = s.replace(/<\/p>/gi, '\n\n');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<[^>]+>/g, '');
  s = decodeEntities(s);
  s = s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return s;
}

function parseXml(xml, source) {
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

    let author = strip(tag(item, 'dc:creator')) || strip(tag(item, 'creator'));
    if (!author && isAtom) {
      const am = item.match(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/i);
      author = am ? strip(am[1]) : '';
    }

    const rawBody =
      tag(item, 'content:encoded') ||
      (isAtom ? tag(item, 'content') : '') ||
      tag(item, 'description') ||
      tag(item, 'summary') ||
      '';

    const md = htmlToMarkdown(rawBody);
    if (md.split(/\s+/).filter(Boolean).length < MIN_WORDS) continue;

    articles.push(mkArticle(source, { title, link, date, author, bodyMd: md }));
  }
  return articles;
}

// ---------- CLEANED-text parser (page-fetch tool output) ----------
//
// The tool strips XML tags but keeps CDATA bodies and their `]]>` closers.
// For a WordPress feed each post's full <content:encoded> body ends up as an
// odd-indexed segment when the doc is split on `]]>`, and closes with a line:
//   The post [TITLE](LINK) appeared first on [NAME](SITE).
// The pubDate for that body lives in the preceding (even) segment.

const DATE_RE = /[A-Z][a-z]{2},\s+\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4}\s+\d{2}:\d{2}:\d{2}\s*[+\-]\d{4}/g;
const APPEARED_RE = /The post\s+\[([\s\S]*?)\]\(([^)]+)\)\s+appeared first on/i;

function lastDate(text) {
  const all = text.match(DATE_RE);
  if (!all || !all.length) return NaN;
  return Date.parse(all[all.length - 1]);
}

function cleanBody(seg) {
  let s = seg;
  // cut everything from the "appeared first on" boilerplate onward
  s = s.replace(/The post\s+\[[\s\S]*?\]\([^)]+\)\s+appeared first on[\s\S]*$/i, '');
  // drop leftover CDATA closers and control noise
  s = s.replace(/\\?\]\\?\]>/g, '');
  s = s.replace(/\[Read more\]\([^)]*\)/gi, '');
  s = decodeEntities(s);
  s = s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return s;
}

function parseCleaned(text, source) {
  const articles = [];
  const segs = text.split(/\\?\]\\?\]>/); // split on ]]> (tool escapes as \]\]>)
  for (let i = 1; i < segs.length; i += 2) {
    const body = segs[i];
    const m = body.match(APPEARED_RE);
    if (!m) continue; // not a full content:encoded body
    const title = strip(m[1]);
    const link = m[2].trim();
    if (!title) continue;
    const bodyMd = cleanBody(body);
    if (bodyMd.split(/\s+/).filter(Boolean).length < MIN_WORDS) continue;
    const date = lastDate(segs[i - 1]);
    articles.push(mkArticle(source, { title, link, date, author: '', bodyMd }));
  }
  return articles;
}

// ---------- main ----------

function loadCache(id) {
  for (const ext of ['md', 'txt', 'xml']) {
    const p = path.join(CACHE, `${id}.${ext}`);
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      if (raw.trim().length > 0) return { raw, ext };
    }
  }
  return null;
}

const all = [];
let sourcesWithContent = 0;
const missing = [];

for (const source of catalog.sources) {
  const cache = loadCache(source.id);
  if (!cache) { missing.push(source.id); continue; }
  try {
    const looksXml = /<item[\s>]|<entry[\s>]|<rss[\s>]|<feed[\s>]/i.test(cache.raw) && cache.ext === 'xml';
    let arts = looksXml ? parseXml(cache.raw, source) : parseCleaned(cache.raw, source);
    // fallback: if cleaned parse found nothing but content has XML items, try XML
    if (!arts.length && /<item[\s>]|<entry[\s>]/i.test(cache.raw)) arts = parseXml(cache.raw, source);
    arts.sort((a, b) => b.publishedAt - a.publishedAt);
    arts = arts.slice(0, MAX_PER_SOURCE);
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
if (missing.length) console.log(`Missing cache (${missing.length}): ${missing.join(', ')}`);
