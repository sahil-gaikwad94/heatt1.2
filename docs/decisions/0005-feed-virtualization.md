# ADR 0005: Bounded rendering for the feed and lists

## Status

Accepted — September 19, 2026.

## Context

The Home feed ("For You") is mechanically continuous: `visibleCount` starts at
8 and the intersection sentinel appends 6 more each time it nears the
viewport. Once every source in the catalog has appeared, a new labelled
"fresh reading loop" begins and the list keeps growing.

That is good product behaviour and it must be preserved — the loop is
deliberately visible and labelled, not hidden. But it has an unbounded DOM
cost. A reader who scrolls for ten minutes will have hundreds of cards
mounted: each with a `motion.article`, an accent bar, tag chips, an inline
"why here" disclosure, and two buttons. Frame rate falls, memory climbs, and
`INP` degrades. On a mid-range Android device at 390×844 this is the most
likely place for the app to stop feeling native.

## Decision

Three layers, applied in this order. Each is individually sufficient at some
scale; together they cover the range.

1. **`content-visibility: auto` with `contain-intrinsic-size`** on every feed
   card. One CSS line, no dependency, and it lets the browser skip layout and
   paint for off-screen cards while keeping them in the DOM (so
   `Ctrl+F`-style find and screen-reader order still work). This is the
   default and the baseline.

2. **Windowing for the long feed** via **`@tanstack/react-virtual`** on the
   Home feed only, once `visibleCount` exceeds a threshold (proposed: 60
   cards). Below the threshold the plain list renders, because virtualization
   costs more than it saves for short lists and complicates scroll
   restoration. License: MIT. Maintenance: active. Bundle: ~5 KB gzipped,
   headless (no styling), which is why it was chosen over a styled
   virtualizer.

3. **`React.memo` on the card components** plus a stable `key` derived from
   the loop index (`${loop}-${blog.id}`) — already the case today, and worth
   keeping — so that appending a batch does not re-render everything above it.

### Why not virtualize everything

Virtualization breaks in ways that matter for this product: in-page find stops
working, the DOM no longer matches the reading order for assistive tech, and
scroll anchoring becomes manual work. Since Home is a *reading* surface, the
`content-visibility` baseline is the better default and windowing is reserved
for the case where it demonstrably is not enough.

### Why not paginate

Pagination would add a deliberate stop to a surface whose whole point is
unhurried browsing, and it would fight the honest "fresh reading loop" label.
It is excluded on product grounds, not technical ones.

## Consequences

### Positive

- Bounded DOM and bounded memory regardless of how long the feed is scrolled.
- No new pattern for short lists, so Rooms, Journal, Wisdom and Explore keep
  their current simple rendering.
- `content-visibility` alone may be sufficient; windowing is the release valve.

### Tradeoffs and risks

- **`IntersectionObserver` sentinel must be re-verified** under virtualization:
  the sentinel is itself a virtualized row, so "append when it nears the
  viewport" needs to be driven by the virtualizer's range rather than by a
  real element. This is the single most likely bug in this change and needs
  its own E2E test that scrolls far enough to cross the threshold.
- `contain-intrinsic-size` must approximate real card height or the scrollbar
  will jump. Card heights vary (long titles, tag count), so the estimate needs
  to be measured from a representative card per theme.
- `data-testid="blog-card"` count assertions in the existing spec
  (`toHaveCount(8)`, `toHaveCount(4)`) must keep passing. Virtualization must
  not change the count of *rendered near the top*, and the existing specs
  assert small counts, so they should be unaffected — but this is verified,
  not assumed.

## Rollout and recovery

1. Ship `content-visibility` alone. Measure INP and scroll FPS under 4× CPU
   throttle.
2. Only if the measurement demands it, add windowing behind the threshold, and
   keep the non-virtualized path as a fallback flag.
3. Revert path: removing the virtualizer restores the plain list with no data
   migration, since virtualization is purely presentational.