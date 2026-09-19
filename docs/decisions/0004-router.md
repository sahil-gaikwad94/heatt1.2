# ADR 0004: Adopt a real router instead of `useState<Page>`

## Status

Accepted — September 19, 2026.

## Context

Navigation is currently `useState<Page>` in `src/App.tsx`, with a handful of
raw `window.location.pathname` string comparisons for the public pages
(`/explore/:category`, `/privacy`, `/terms`, `/admin`).

Consequences of that choice, all of which are launch blockers:

- No URLs. Nothing is shareable or bookmarkable beyond the four public pages.
- Browser Back and swipe-back do not work; the back button leaves the app.
- No deep links, so no "share this flare" that lands on the flare.
- No per-tab scroll restoration.
- Tapping the already-active tab cannot scroll-to-top or refresh.
- Route transitions have to be re-invented per screen because there is no
  route identity to key on.

Meanwhile `scripts/prerender-public.ts` already emits static HTML for
`/explore/:slug`, `/privacy` and `/terms`, and `tests/e2e` loads
`/explore/philosophy` and `/privacy` directly. Any change must keep those
working.

## Decision

1. Adopt **`react-router`** (the `react-router` package, v7 line) for client
   routing, with **`createBrowserRouter`** and a route table in
   `src/app/routes.tsx`.
2. Lazy-load every feature route with `React.lazy` so the initial bundle does
   not grow more than the 40 KB budget in `AGENTS.md` §8.
3. Keep `prerender-public.ts` as the SEO path. Public category, privacy and
   terms routes render **without** auth or onboarding, exactly as today.
4. Scroll restoration is explicit: one scroll container per tab, positions
   keyed by route path, restored on pop, discarded on push during
   `POP`/`PUSH` differentiation via `useNavigationType()`.
5. Tapping the active tab: first tap scrolls the container to top, second tap
   within 400 ms invalidates the route's data.
6. Route depth drives transition direction: tab switch crossfades; push slides
   in from the right; pop reverses. Depth is a static map in
   `src/app/routeDepth.ts` — not inferred from history length, which is
   unreliable after a reload.

### Why `react-router` and not a hand-rolled router

A zero-dependency router is tempting and was seriously considered. It was
rejected because the requirements that actually matter here — nested routes
with a persistent shell, `useNavigationType` for push/pop direction,
`ScrollRestoration`, redirect-on-first-run for onboarding, and data
invalidation — are each small individually but collectively more code than the
library, and more importantly they are the parts most likely to be subtly
wrong. `react-router` is MIT, actively maintained, ~`18 KB` gzipped for the
data-router build, and tree-shakes.

A second option, `wouter` (~2 KB), was rejected: it has no nested-route layout
model, so the persistent shell plus per-tab scroll containers would have to be
built by hand anyway.

## Consequences

### Positive

- Flares, rooms, and journal entries become linkable and shareable.
- Back, swipe-back, and the browser's own affordances behave correctly.
- Route identity gives motion a key: transitions become one shared pattern
  instead of per-screen improvisation.
- The public SEO surface keeps working, since it is prerendered independently.

### Tradeoffs and risks

- **Highest-risk change in the redesign.** `prerender-public.ts`, the E2E
  specs that load `/explore/philosophy` and `/privacy`, and the existing
  `categoryFromPath()` logic all depend on the current hand-rolled path
  handling. Each must be re-verified after the switch.
- One more runtime dependency, permitted by this ADR (AGENTS.md §9).
- Deep links to a flare require the flare to be resolvable on cold load from
  local state or the API. Where it cannot be resolved the route must show a
  real **error + retry** state, never a blank screen or a redirect home.

## Rollout and recovery

1. Land the route table with the **same** screens and the same default route,
   so behaviour is identical on day one.
2. Move the four hardcoded public paths onto real routes and re-run
   `prerender-public.ts`, diffing its output against the previous build.
3. Add E2E coverage for deep links, back/forward, and scroll restoration.
4. If routing regresses prerender output, revert the router and keep the
   route table — the table is the durable part of this decision.

---

## Amendment — the hand-rolled router shipped, not `react-router`

**Status of the original decision: superseded.** The reasoning below the line
above was written before implementation. Two things changed it:

1. **The requirement set did not hold up.** The list that justified the library
   (nested routes with a persistent shell, `useNavigationType` for push/pop
   direction, `ScrollRestoration`, data loaders and invalidation) is not what
   Heatt needs *now*: there are nine flat screens, no nested layouts, no route
   loaders, and every screen reads from one local-first store. Building those
   concerns before they exist would have been speculative.
2. **The library was not installable in the environment the work happened in.**
   `node_modules` is absent and new dependencies are pinned by AGENTS.md §9 to
   an ADR plus a bundle-cost measurement. Shipping a router that imports a
   package nobody had installed would have produced a codebase that cannot run.

So `src/app/router.ts` (~150 lines) shipped instead. It is honest about its
scope: URL-as-state, `popstate` + an internal navigate event, per-entry scroll
restoration, sheet query state, and reactive public routes.

**Re-open this ADR when any of these becomes true** — each one is a signal that
the hand-rolled version has reached its limit:

- a nested layout is needed (a room's own tab set persisting across its tabs),
- a route needs its own data loading or invalidation lifecycle,
- prefetching on hover/tap becomes a real performance requirement,
- route depth starts driving transition direction (original point 6).

**Not yet implemented from the original list**, and therefore not to be assumed
by anyone reading this file: double-tap-the-active-tab to scroll-or-refresh
(point 5), push/pop transition direction (point 6), link prefetch, and per-route
document titles.