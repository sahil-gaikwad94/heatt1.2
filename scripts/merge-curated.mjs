// Merge hand-curated full-text articles (scripts/curated/<sourceId>--<slug>.md)
// into mobile/src/data/articles.json, preserving any already-ingested articles.
//
// Each curated file is the article BODY in markdown. A sidecar map below supplies
// the title, publish date, and canonical URL. Content is rights-cleared and hosted
// fully in-app (the reader never redirects).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CURATED = path.join(__dirname, 'curated');
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'mobile/src/data/blogCatalog.json'), 'utf8'));
const sourceById = Object.fromEntries(catalog.sources.map((s) => [s.id, s]));

// title / date / url metadata for each curated file
const META = {
  'cal-newport--superintelligence-fairy-tale': {
    title: 'Superintelligence is a fairy tale. But chasing it can still cause harm.',
    date: '2026-09-10', url: 'https://calnewport.com/superintelligence-is-a-fairy-tale-but-chasing-it-can-still-cause-harm/',
  },
  'of-dollars-and-data--best-portfolio-50-years': {
    title: 'What was the best portfolio over the last 50 years?',
    date: '2026-09-15', url: 'https://ofdollarsanddata.com/what-was-the-best-portfolio-over-the-last-50-years/', author: 'Nick Maggiulli',
  },
  'mr-money-mustache--shockingly-simple-math-social-security': {
    title: 'The shockingly simple math behind Social Security',
    date: '2026-04-16', url: 'https://www.mrmoneymustache.com/2026/04/16/the-shockingly-simple-math-behind-social-security/',
  },
  'ness-labs--saving-is-not-remembering': {
    title: 'Saving is not remembering: building a second memory',
    date: '2026-09-08', url: 'https://nesslabs.com/', author: 'Anne-Laure Le Cunff',
  },
  'marginalian--edward-abbey-live-die': {
    title: 'Edward Abbey on how to live and how to die',
    date: '2026-09-19', url: 'https://www.themarginalian.org/2026/09/19/edward-abbey-live-die/', author: 'Maria Popova',
  },
  'marginalian--andre-gregory-work-life': {
    title: 'Against the Cartesian myth of work/life balance',
    date: '2026-09-18', url: 'https://www.themarginalian.org/2026/09/18/andre-gregory-richard-avedon-letter/', author: 'Maria Popova',
  },
  'marginalian--seneca-time': {
    title: 'The Stoic key to living with presence: Seneca on time',
    date: '2026-09-18', url: 'https://www.themarginalian.org/2026/09/18/seneca-letter-1-time/', author: 'Maria Popova',
  },
  'colossal--jaume-plensa-beyond-silence': {
    title: 'Jaume Plensa\u2019s monumental sculptures unite scale and material',
    date: '2026-09-18', url: 'https://www.thisiscolossal.com/2026/09/jaume-plensa-beyond-silence/',
  },
  'hackaday--teaching-robot-hand-to-walk': {
    title: 'Teaching a robot hand to walk',
    date: '2026-09-19', url: 'https://hackaday.com/2026/09/19/teaching-a-robot-hand-to-walk/',
  },
};

function readingMinutes(md) {
  return Math.max(1, Math.round(md.split(/\s+/).filter(Boolean).length / 220));
}
function excerptOf(md) {
  const src = md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/[#>*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return src.slice(0, 180).trim() + (src.length > 180 ? '…' : '');
}

const existing = JSON.parse(fs.readFileSync(path.join(ROOT, 'mobile/src/data/articles.json'), 'utf8'));
const byId = new Map(existing.map((a) => [a.id, a]));

let added = 0;
for (const file of fs.readdirSync(CURATED).filter((f) => f.endsWith('.md'))) {
  const key = file.replace(/\.md$/, '');
  const meta = META[key];
  if (!meta) { console.warn(`no META for ${key}, skipping`); continue; }
  const sourceId = key.split('--')[0];
  const source = sourceById[sourceId];
  if (!source) { console.warn(`unknown source ${sourceId}, skipping`); continue; }
  const body = fs.readFileSync(path.join(CURATED, file), 'utf8').trim();
  const id = key;
  byId.set(id, {
    id,
    sourceId,
    title: meta.title,
    author: meta.author || source.name,
    publishedAt: Date.parse(meta.date),
    category: source.category,
    tags: source.tags,
    cover: '',
    excerpt: excerptOf(body),
    body,
    readingMinutes: readingMinutes(body),
    canonicalUrl: meta.url,
  });
  added++;
}

const merged = Array.from(byId.values()).sort((a, b) => b.publishedAt - a.publishedAt);
fs.writeFileSync(path.join(ROOT, 'mobile/src/data/articles.json'), JSON.stringify(merged, null, 2));
console.log(`Curated added/updated: ${added}`);
console.log(`Total articles: ${merged.length}`);
console.log(`Sources covered: ${new Set(merged.map((a) => a.sourceId)).size}`);
console.log(`Categories: ${[...new Set(merged.map((a) => a.category))].join(', ')}`);
