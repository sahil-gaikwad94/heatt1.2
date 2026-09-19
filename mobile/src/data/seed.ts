import { blogCatalog } from './catalog';
import { allArticles } from './articles';
import type { Author, Flare, Room } from '../state/types';

/**
 * Every publisher in the catalog becomes an author, using the publisher's own
 * name. Flares are built from real, in-app article content (rights owned) — the
 * Reader renders the full body natively and never redirects to another site.
 */
export const publisherAuthors: Author[] = blogCatalog.map((s) => ({
  id: `pub-${s.id}`,
  name: s.name,
  handle: s.domain.replace(/^www\./, '').split('.')[0],
  initials: s.initials,
  accent: s.accent,
  bio: s.description,
  isPublisher: true,
  domain: s.domain,
}));

export const USER_ID = 'user';

// Each article becomes an Article flare authored by its publisher.
export const seedFlares: Flare[] = allArticles.map((a) => ({
  id: `seed-${a.id}`,
  authorId: `pub-${a.sourceId}`,
  type: 'Article' as const,
  topic: a.category,
  title: a.title,
  text: a.excerpt,
  createdAt: a.publishedAt || Date.parse('2026-09-01T09:00:00Z'),
  tags: a.tags,
  sourceId: a.sourceId,
  articleId: a.id,
}));

const NOW = Date.parse('2026-09-20T09:00:00Z');

export const seedRooms: Room[] = [
  {
    id: 'room-morning-pages',
    name: 'Morning pages',
    description: 'A quiet room for people who write three pages before the day gets loud.',
    topic: 'Creative practice',
    privacy: 'public',
    ownerId: 'pub-austin-kleon',
    members: [],
    inviteCode: 'MORNING',
    createdAt: NOW - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: 'room-slow-reading',
    name: 'Slow reading club',
    description: 'One good essay a week, read closely, discussed without hurry.',
    topic: 'Books & ideas',
    privacy: 'public',
    ownerId: 'pub-marginalian',
    members: [],
    inviteCode: 'SLOWREAD',
    createdAt: NOW - 1000 * 60 * 60 * 24 * 9,
  },
  {
    id: 'room-good-questions',
    name: 'A life of good questions',
    description: 'We trade better questions, not quick answers.',
    topic: 'Philosophy',
    privacy: 'public',
    ownerId: 'pub-seths-blog',
    members: [],
    inviteCode: 'QUESTIONS',
    createdAt: NOW - 1000 * 60 * 60 * 24 * 2,
  },
];

export function allSeedAuthors(): Author[] {
  return publisherAuthors;
}
