import articlesRaw from './articles.json';
import { blogCatalog, sourceById, type BlogSource } from './catalog';

export type Article = {
  id: string;
  sourceId: string;
  title: string;
  author: string;
  publishedAt: number;
  category: string;
  tags: string[];
  cover: string;
  excerpt: string;
  body: string; // markdown, hosted in-app
  readingMinutes: number;
  canonicalUrl?: string; // provenance only — never used to redirect
};

const ingested = articlesRaw as Article[];

// Build a synthetic article for any source that has no ingested full text yet,
// so the reader is always in-app and never redirects.
function fallbackArticle(source: BlogSource): Article {
  const body = [
    source.description,
    '',
    `## About ${source.name}`,
    '',
    `${source.name} publishes on ${source.category.toLowerCase()} — ${source.tags.join(', ')}.`,
    '',
    'The full library from this author is being brought into Heatt. Until every piece is ingested, this is the editorial overview of what you\u2019ll find here — read entirely inside the app, never redirected away.',
  ].join('\n');
  return {
    id: `${source.id}--overview`,
    sourceId: source.id,
    title: source.name,
    author: source.name,
    publishedAt: 0,
    category: source.category,
    tags: source.tags,
    cover: '',
    excerpt: source.description,
    body,
    readingMinutes: 2,
  };
}

// One list: ingested first, then a fallback per source that has zero ingested.
const bySource = new Map<string, Article[]>();
for (const a of ingested) {
  const list = bySource.get(a.sourceId) ?? [];
  list.push(a);
  bySource.set(a.sourceId, list);
}
for (const s of blogCatalog) {
  if (!bySource.has(s.id)) bySource.set(s.id, [fallbackArticle(s)]);
}

export const allArticles: Article[] = Array.from(bySource.values())
  .flat()
  .sort((a, b) => b.publishedAt - a.publishedAt);

export function articleById(id: string): Article | undefined {
  return allArticles.find((a) => a.id === id);
}

export function articlesForSource(sourceId: string): Article[] {
  return allArticles.filter((a) => a.sourceId === sourceId);
}

export function ingestedCount(): number {
  return ingested.length;
}

export function articleSource(article: Article): BlogSource | undefined {
  return sourceById(article.sourceId);
}
