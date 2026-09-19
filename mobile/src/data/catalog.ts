import raw from './blogCatalog.json';
import wisdomRaw from './wisdom.json';

export type BlogAccent = 'coral' | 'sage' | 'lilac' | 'amber' | 'ink';

export type BlogSource = {
  id: string;
  name: string;
  domain: string;
  url: string;
  category: string;
  description: string;
  publisher: string;
  tags: string[];
  initials: string;
  accent: BlogAccent;
};

export type WisdomEntry = {
  id: string;
  title: string;
  sourceText: string;
  source: string;
  author: string;
  editorialContext: string;
  practicePrompt: string;
  attribution: string;
  sourceUrl: string;
  tags: string[];
  interpretation?: string;
};

const catalog = raw as {
  categories: string[];
  reviewedOn?: string;
  sources: BlogSource[];
};

export const blogCategories: string[] = catalog.categories;
export const blogCatalog: BlogSource[] = catalog.sources;
export const blogCatalogReviewedOn: string = catalog.reviewedOn ?? '';

export const wisdomLibrary: WisdomEntry[] = (wisdomRaw as any[]).map((w) => ({
  id: w.id,
  title: w.title,
  sourceText: w.sourceText,
  source: w.source,
  author: w.author ?? w.source,
  editorialContext: w.editorialContext,
  practicePrompt: w.practicePrompt,
  attribution: w.attribution,
  sourceUrl: w.sourceUrl,
  tags: w.tags ?? [],
  interpretation: w.interpretation,
}));

// Accent → base hue used by the generative cover.
export const accentHue: Record<BlogAccent, number> = {
  coral: 14,
  sage: 150,
  lilac: 272,
  amber: 38,
  ink: 220,
};

export function sourceById(id: string): BlogSource | undefined {
  return blogCatalog.find((s) => s.id === id);
}

export function sourcesByCategory(category: string): BlogSource[] {
  if (category === 'All') return blogCatalog;
  return blogCatalog.filter((s) => s.category === category);
}
