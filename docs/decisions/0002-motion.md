e# ADR 0002: Motion is a token system, and reduced motion is a first-class path

## Status

Accepted — September 19, 2026. Formalises a decision already present in code
(`MotionConfig reducedMotion="user"` was set before this ADR existed; this
document records why, and extends it).

## Context

`motion` v13 is already a dependency and the app already wraps itself in
`MotionConfig reducedMotion="user"`, which is correct and must be kept. What
was missing is discipline around *values*: springs, durations and easings were
written inline at each call site, with different numbers for the same
intention (`stiffness: 380, damping: 26` in one file, `420/34` in another,
`[0.22, 1, 0.36, 1]` repeated in a dozen places).

Three consequences:

1. **No theme personality.** The brief requires Midnight to feel snappier and
   more tactile, Paper to feel precise with no overshoot, and Ember to feel
   softest. Inline numbers make that impossible to express once and apply
   everywhere.
2. **No budget enforcement.** Nothing stopped a screen from animating layout
   properties or from running several ambient loops at once.
3. **Reduced motion was all-or-nothing.** `MotionConfig` handles the OS
   setting, but there was no in-app override (required by the brief) and no
   deliberate design for the reduced-motion *experience* — only suppression.

## Decision

1. **`src/motion/tokens.ts` is the only place motion values exist.** It
   exports named springs (`snappy`, `soft`, `pop`), durations (160 / 280 /
   480 ms), easings, and a `useMotionTokens()` hook that returns values scaled
   by the active theme.

   | Theme | Personality | Scaling |
   |---|---|---|
   | Ember | fluid, breathing | softest springs, longest ambient drift |
   | Midnight | snappy, springy | higher stiffness, visible overshoot |
   | Paper | precise, minimal | shortest durations, **zero** overshoot |

2. **`useMotionPrefs()` is the single source of truth** for whether motion is
   allowed. It combines the OS `prefers-reduced-motion` media query with an
   in-app override stored in Heatt state (`settings.reduceMotion`), where the
   override may *increase* or *decrease* motion relative to the OS, but can
   never force motion on for someone whose OS asks for none.

3. **Property allowlist.** Only `transform`, `opacity` and `filter` may be
   animated. `width`, `height`, `top`, `left`, `margin` and `padding` are not
   animatable in this codebase — this is reviewable in diff, and is the single
   rule that most protects frame rate.

4. **Ambient budget.** At most one ambient loop on screen. Loops pause on
   `visibilitychange` and when scrolled out of view via `IntersectionObserver`.
   Particles ≤ 12.

5. **Entrance budget.** One orchestrated entrance per screen. Feed cards
   stagger on **first paint only** — never on load-more, where an entrance
   animation on 6 new cards competes with the scroll the reader is already
   performing.

6. **Reduced motion is designed, not suppressed.** Under reduced motion:
   opacity-only or instant swaps, ambient loops off entirely, the onboarding
   marquee becomes a static wrapped grid, parallax off, and hold-to-charge
   becomes an immediate discrete step. A second Playwright project runs with
   `reducedMotion: 'reduce'` so this path is actually exercised.

### Why `LazyMotion` + `m`

The full `motion` component drags in every feature (~34 KB gzipped). `motion`
v13's `LazyMotion` with the `domAnimation` feature bundle plus `m` components
keeps the interactive surface while cutting the initial cost substantially.
This is the difference between staying inside the 40 KB-per-phase budget in
`AGENTS.md` §8 and blowing through it.

### Rejected: a CSS-only motion system

Considered to remove the dependency entirely. Rejected because the product
depends on interruptible, spring-based, user-driven motion — drag-to-dismiss
sheets tied to velocity, `layoutId` tab indicators, hold-to-charge with
`useMotionValue`, and counter rolling with `useSpring`. CSS transitions cannot
interrupt mid-flight against a live gesture, which is precisely the "feels
native" quality being bought here.

## Consequences

### Positive

- Theme personality becomes a one-line change in one file.
- The motion budget is enforceable by inspection, not by opinion.
- Reduced motion is a tested, designed path instead of a gap.

### Tradeoffs and risks

- Migrating existing inline values is mechanical but touches every animated
  component; a missed conversion means that component silently ignores the
  theme scaling. Mitigated by grepping for animatable number literals in a
  check script.
- `useMotionPrefs` reading OS state must not block first paint. It reads
  synchronously from a media query and lazily from storage.

## Rollout and recovery

1. Land `tokens.ts` and `useMotionPrefs()` with no call sites changed.
2. Convert components file by file. Behaviour must be identical at the end of
   each conversion — this is a refactor, not a redesign.
3. Add the reduced-motion Playwright project.
4. Revert path: tokens are additive; a component can keep inline values and
   still work, so this migration cannot break the app if interrupted.

---

## Implementation notes (added after the build)

**Shipped:** `src/motion/tokens.ts` exports `duration`, `ease`, `spring`,
`distance`, `readMotionMode`, `writeMotionMode`, `applyMotionMode`,
`prefersReducedMotion` and `motionConfigFor`. `src/theme/tokens.css` mirrors the
durations and easings as `--dur-*` / `--ease-*`, and the shell applies the mode
through `motionConfigFor()` instead of a hardcoded `reducedMotion="user"`.

**One change to the decision above, and it is a tightening.** The override is
`{ system, reduced }` — there is no mode that removes the OS's request for less
motion. During implementation an `full` mode was written that did exactly that,
which contradicted the rule in point 2 of the Decision ("can never force motion
on for someone whose OS asks for none"). The rule won and the mode was removed,
because an accessibility preference that the app can overrule is not a
preference. `heatt-motion` is mirrored onto `<html data-motion="reduced">` so CSS
honours it too, and `index.html` reads it in the no-flash boot script.

**Still owed from this ADR**, listed here so nobody assumes otherwise:

- the theme-scaled personalities (`useMotionTokens()`: Ember softest, Midnight
  snappiest, Paper zero-overshoot) — the token *shapes* exist, the per-theme
  scaling does not,
- converting call sites off inline numbers; `src/App.tsx` still has literal
  `ease: [0.22, 1, 0.36, 1]` transitions,
- the `LazyMotion` + `m` conversion (still importing full `motion`),
- the second Playwright project with `reducedMotion: 'reduce'`.