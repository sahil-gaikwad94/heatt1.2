# AGENTS.md — binding architecture and invariants

> This file is the contract for anyone (human or agent) changing Heatt.
> If a change conflicts with this file, the change is wrong. If this file is
> wrong, amend it first in its own commit with a reason.

---

## 1. Product identity

**Heatt** — "Where your mind catches fire."

A mobile-first, text-first social reading and writing app: microblogging
(blogs + short posts) with a recommendation system that is honest about
itself. Not an engagement-maximizing entertainment platform, not an AI app,
not therapy.

Vocabulary (use these words, not the old ones):

| Concept | Term |
|---|---|
| A post — short text, question, poem, practice | **flare** |
| The only reaction — one per person, intensity 1–3 | **heat** |
| A person | **reader** |
| A curated topic collection | **shelf** |
| A community space (public or private) | **room** |
| The guide characters | **companions** (Kindle, Dusk, Ink, Lumen, Hearth) |
| The three visual personalities | **3 themes reference in artifacts** |
| Private writing | **journal** |

Theme *ids* stay `ember`, `midnight`, `ink` for stored-state compatibility.
The display name for the `ink` id is **Paper**. `src/types.ts`
`normalizeTheme()` maps legacy `paper` → `ink` on read.

---

## 2. Non-negotiable product principles

Each of these is load-bearing. A feature that violates one is rejected, not
tuned.

1. **No synthetic activity.** No fabricated readers, counts, "3 people
   reading now", social proof, or "new" badges that aren't real. The
   cold-start feed uses a real curated catalog of real publishers.
2. **No manufactured urgency.** No countdowns, limited offers, streaks,
   "you're on a roll", or guilt copy.
3. **No paywall or blurred-premium patterns.**
4. **Progress without pressure.** Counters only increase. Nothing resets.
   Nothing shames a gap. Show **waypoints**, never percentages or scores.
5. **Collective without competitive.** Social proof may show that others are
   engaged. It never shows a ranked list of *who*.
6. **One heat per reader per flare**, intensity 1–3, toggles off.
7. **500-grapheme** composer limit, enforced client *and* server.
8. **Journal is private by construction.** Never feeds ranking, share cards,
   search, or training. Asserted by test.
9. **Every gesture has a non-gesture, non-hover, non-long-press
   alternative.** Keyboard and screen-reader paths are first-class.
10. **Every screen has loading, empty, error and retry states.** Empty states
    are invitations, not errors.
11. **Reduced motion** honours the OS setting *and* an in-app override. No
    animation may be required to use the app.
12. **Explicit preferences beat guesses.** "Why this appeared" is always
    available and correctable.
13. **Companions are labelled companions.** They never post, never appear as
    authors, never send push notifications, and use scripted lines only.

---

## 3. Rights boundary (the hardest line in this repo)

Heatt may **link to** other people's work. Heatt may **write about** it in its
own words. Heatt may **not** copy it, re-host it, or launder it through a
third-party service.

| Allowed | Forbidden |
|---|---|
| A card with the publisher's own byline, a summary written by Heatt, and a prominent link out | Fetching an article body through `r.jina.ai`, `allorigins.win`, or any other CORS/reader proxy |
| Catalog metadata the publisher already exposes (name, domain, description) | Storing or caching third-party article text, in `localStorage` or anywhere else |
| Quoting a short public-domain span with attribution + jurisdiction caveat | Reproducing a licensed edition, translation, or editorial apparatus |
| A reader whose content is authored by Heatt or licensed to Heatt | Rendering a third party's body as if it were a Heatt flare |

Enforcement:

- The reader may only obtain content from a `ReaderAdapter`. A new adapter must
  declare its provenance in `docs/decisions/`.
- No runtime request may leave the origin except Supabase (auth + data), the
  publisher link a reader taps themselves, and an optional image CDN declared in
  the CSP. **No font CDN. No analytics. No proxies.**
- Visible copy must state that Heatt wrote the summary and that the work belongs
  to its author. Never phrase a summary as if it were the article.

See `docs/decisions/0003-open-web-ethics.md` and `0006-rights-safe-reader.md`.

---

## 4. Layout contract

- **Mobile-first, app-shaped.** Phone layout is the product; tablet and desktop
  are progressive enhancement. Never make a feature desktop-only.
- Shell: sticky app bar (`--bar-h`) + content column (`--content-max`) +
  floating tab bar (`--tab-h`) on phones; at `>=1024px` the tab bar becomes a
  sidebar (`--sidebar-w`) and a right rail (`--rail-w`) may appear.
- Every fixed or sticky surface respects `--safe-top` / `--safe-bottom`.
- Tap targets are `>= var(--tap)` (44px), including icon-only buttons, whose
  `aria-label` is mandatory.
- No body-copy measure exceeds `--content-max`. Long-form reading uses
  `--font-read`.
- Layout uses logical properties (`padding-inline`, `margin-block-end`) so RTL
  stays viable.

---

## 5. State contract

- One durable object: `localStorage['heatt-state']`, validated field-by-field on
  read by `loadState()`. **Never** assume a stored shape — always default it.
- Keys Heatt owns: `heatt-state`, `heatt-draft`, `heatt-custom-rooms`,
  `heatt-motion`. Adding a key requires an ADR.
- Adding a field: optional in the type, defaulted in `loadState()`, never
  removed without a migration note. Removing a field leaves the stored value
  inert and harmless.
- `theme` is stored as the id (`ember` | `midnight` | `ink`). `normalizeTheme()`
  maps legacy `paper` -> `ink` on read. Do not add a fourth id.
- Ephemeral UI state (which page, which sheet, search text) lives in React
  state, **never** in `localStorage`.
- Server-backed data (Supabase) always degrades to local-first behaviour: a
  failed request is silent, never a dead screen.

---

## 6. Navigation contract

- Routes are real URLs parsed by `src/app/router.ts`. `useState<Page>` is not a
  router; raw `window.location.pathname` checks in render are not either.
- `navigate(path)` pushes history; back/forward restores the exact screen and
  its scroll position. `popstate` is handled once, in the shell.
- Any screen reachable by a tab must be reachable by URL.
- Sheets/modals are query state (`?sheet=tuner`) so the system back gesture
  dismisses them and they are deep-linkable.
- Focus moves to the new screen's heading on navigation and returns to the
  trigger when a sheet closes. Escape closes the topmost layer.

---

## 7. Motion contract

- Motion never carries meaning that the text does not already carry.
- Durations and easings come from `src/motion/tokens.ts` (mirrored as
  `--dur-*` / `--ease-*`). No inline magic numbers.
- Reduced motion is honoured from the OS **and** an in-app override
  (`heatt-motion`). The override only ever adds stillness: it can never give
  motion to a reader whose OS asks for less (ADR 0002).
- No animation may be required to reach content. Reveals fire `once` and never
  block interaction.
- View Transitions are progressive enhancement: guard on
  `document.startViewTransition` and fall back to a plain state change.

---

## 8. Accessibility & performance gates

- WCAG 2.2 AA. `npm run test:contrast` parses `src/theme/tokens.css` and fails
  below 4.5:1 for text and 3:1 for large text and UI borders.
- Keyboard: every control reachable in DOM order, visible `:focus-visible` ring
  on all three themes, no keyboard trap, Escape closes layers.
- The whole app must be usable by screen reader with no pointer gesture.
- `aria-live="polite"` for async results; `role="status"` for toasts.
- Budget: JS to a phone `< 180KB` gzip, LCP `< 2.5s` on 4G, feed interaction at
  60fps. Long lists use `content-visibility` / virtualization
  (`docs/decisions/0005-feed-virtualization.md`).
- No layout shift on theme change: themes are pure token swaps on `<html>`.
- Images are `loading="lazy"` with explicit dimensions, or CSS art.

---

## 9. Dependency policy

- `react`, `react-dom`, `motion`, `vite`, `typescript`, `hono`, `zod`,
  `@supabase/supabase-js`, `@playwright/test`. That list is the budget.
- A new dependency needs an ADR covering bundle cost, maintenance signal, and
  what in-repo code it replaces. Preference order: platform > 40 lines of our
  own code > library.
- No runtime third-party requests (fonts, CDNs, analytics, error reporting).
- `"latest"` as a version specifier is debt; pin it when you touch a package.

---

## 10. Testing gates

Before calling anything done, all of these must pass on the machine doing the
work:

| Command | Gate |
|---|---|
| `npm run check` | TypeScript clean, no new `any` escapes |
| `npm run api:check` | API types |
| `npm run test:contrast` | Parses real tokens, AA on all three themes |
| `npm run test:blogs` | 53 sources / 13 categories intact |
| `npm run test:recommendations` | Ranking invariants |
| `npm run test:content` | Wisdom rights metadata |
| `npm run test:e2e` | Both specs: testids, 8 cards + 6 on scroll |

If a command cannot be run, say so explicitly and hand it to the human. Never
report a command as passing when it was not executed.

---

## 11. Dead-control rule and known debt

A control that does nothing is a bug, not a placeholder. Ship it wired, or
don't ship it. Tracked debt to clear before launch:

| Control | State | Decision |
|---|---|---|
| Notification bell | Renders, no handler | Remove until real notifications exist |
| Wisdom "Quiet mode" | Renders, no handler | Remove until it changes behaviour |
| Wisdom "Browse all" | Renders, no handler | Wire to a wisdom index or remove |
| Sign out | Missing | Add to Settings once Supabase is configured |
| `FlareReader.tsx` | Rights violation, dead code | Removed — see `0006-rights-safe-reader.md` |
| `src/styles.css` | Shell chrome still carried legacy literals (`background: rgba(247,244,238,.91)` on `.topbar`, `#eeeae2`/`.#a29f97`/`.#913b29`/`.#eee9df`/`.#a7bdaa` on search, buttons, tabs). `.app-shell`/`.topbar`/`.mobile-nav` were each defined once (the historical triplication is gone). **Tokenised Sep 2026** — every colour is now a `var(--*)` draw so the shell reads the active personality. `ds-glass` on `.topbar` is now redundant but harmless. | Tokenised; `ds-glass` workaround is dead weight, remove once `styles.css` is retired |
| `src/landing-overrides.css` | Not imported by anything | Either import it deliberately or delete it |
