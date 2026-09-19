# ADR 0006: A rights-safe in-app reader (removing the article proxy)

## Status

Proposed — September 19, 2026. **Requires explicit product-owner approval
before any reader work ships.** Raised because the existing code violates a
stated invariant.

## Context

`src/components/FlareReader.tsx` opened catalog sources *inside* Heatt. To do
that it fetched the third-party article body through public CORS proxies:

```
https://r.jina.ai/<url>
https://api.allorigins.win/raw?url=<url>
```

then converted the response into heading/paragraph/quote/list blocks, rendered
it as a "flare", and cached it in
`localStorage['heatt-reader-cache']` for seven days.

This is prohibited on four independent grounds:

1. **`docs/decisions/0003` and `README.md`:** "Heatt does not ingest or
   reproduce article bodies, publisher images, RSS excerpts, bylines, or
   publication metrics."
2. **Agent brief §2:** do not implement scraping or republishing of
   third-party articles; stop and write an ADR instead.
3. **`AGENTS.md` §9:** no third-party runtime requests. The proxies also leak
   every URL a reader opens to two unrelated third parties, which is a privacy
   problem independent of the rights problem.
4. The component's own footer claimed "Heatt stores only a local copy for
   you" — describing the opposite of what it did.

The component is currently unreferenced (dead code), so nothing regresses by
removing it. But it ships a prohibited pattern in the tree, and the new UI copy
("articles open inside Heatt") implies it exists.

## Decision

**Remove the proxy-based reader entirely.** Delete `FlareReader.tsx` and the
`heatt-reader-cache` key. Replace it with a reader whose content source is
explicit and pluggable.

```ts
// src/features/reader/contentAdapter.ts
export type ReaderContent =
  | { kind: 'full';   title: string; credit: string; blocks: ReaderBlock[] }
  | { kind: 'excerpt'; title: string; credit: string; blocks: ReaderBlock[] }
  | { kind: 'external'; title: string; credit: string; editorial: string; url: string }

export type ReaderAdapter = {
  id: string
  canRead(subject: ReaderSubject): boolean
  load(subject: ReaderSubject): Promise<ReaderContent>
}
```

Adapters may exist **only** for content with verified rights:

| Adapter | Source | Rights basis |
|---|---|---|
| `flareAdapter` | the reader's own flares | authored by the reader |
| `wisdomAdapter` | `content/wisdom/library.json` entries whose `rightsStatus` permits publication | recorded per entry |
| `catalogAdapter` | `src/data/blogCatalog.ts` | **Heatt's own editorial description only** |
| `originalAdapter` | licensed/owned article bodies | requires a recorded rights decision per source, added later |

For any third-party source, the reader renders:
- the title and the **credit** (publisher + author as given in the catalog),
- **Heatt's own editorial description** — which Heatt wrote and owns,
- a prominent, primary **"Open at <domain>"** action,
- and an explicit line saying the full work lives with the publisher.

The reader *never* contains a fetch of a third-party article, and never
presents publisher text as if it were Heatt content.

### What this means for copy

UI copy must stop saying that articles open inside Heatt. Correct phrasing:
"Read Heatt's notes on this source, then open it at the publisher."

### Reading features that survive

These are reader-side (Heatt-owned surface) and are unaffected:

- text controls (size S/M/L, serif/sans/Atkinson, line height),
- keep-a-line → private journal (with the source credited),
- heat, reply, copy,
- the flame progress line,
- "More from this shelf".

## Consequences

### Positive

- Removes a rights violation and a privacy leak in one change.
- Removes two third-party runtime dependencies, making the app's network
  surface auditable: Heatt + the configured API, nothing else.
- The pluggable adapter means that **when the rights are in place** for owned
  or licensed material, it becomes a data change, not a rewrite.

### Tradeoffs

- Readers must leave the app for third-party full text. This is a real
  product-experience cost, and it is the correct one: Heatt's differentiator
  is curation and honesty, not being a proxy.
- The reader is less impressive as a demo until licensed content exists.
- When licensed bodies do arrive, each source needs a recorded decision before
  its adapter may return `kind: 'full'`. `test:content` should be extended to
  fail on a `full` adapter whose source has no rights record.

## Rollout and recovery

1. Delete the proxy reader and the cache key, in a commit that changes no
   other behaviour.
2. Land the adapter interface with only `flareAdapter`, `wisdomAdapter` and
   `catalogAdapter` implemented.
3. Add the `test:content` assertion forbidding `kind: 'full'` without a rights
   record.
4. Revert path: none needed. Re-adding a third-party proxy is not a legitimate
   option, and this ADR exists so that it does not get re-added by accident.