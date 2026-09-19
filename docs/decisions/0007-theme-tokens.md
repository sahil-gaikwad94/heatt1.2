# 0007 — Theme tokens are a single parsed source of truth

- **Status:** accepted
- **Date:** 2026-09-19
- **Supersedes:** the ad-hoc `:root` block in `src/styles.css` and the
  three-blocks-plus-legacy-remaps layout of `src/theme.css`

## Context

Three palettes shipped (`ember`, `midnight`, `ink`) spread across two files:
`src/styles.css` declared a warm default set, and `src/theme.css` redeclared and
overrode it per `html[data-theme]` and then remapped ~20 legacy variable names
(`--paper`, `--card`, `--ink`, `--surface-*`) so that seventeen older
stylesheets kept working.

Three problems followed.

1. **Two sources of truth.** A colour existed as a literal in `styles.css` and
   as a different literal in `theme.css`. Whichever file loaded last won, and
   the CSS import order in `main.tsx` silently decided the outcome.
2. **The contrast gate was fiction.** `scripts/theme-contrast-check.ts` asserted
   hardcoded hex values (`#d9f74a`, `#bd4328`, `#fbf1e9`) that no longer existed
   anywhere in the theme files. It passed while measuring nothing.
3. **No structural tokens.** Radii, spacing, type ramp, durations, blur, tap
   targets and safe-area insets were magic numbers repeated per stylesheet, so
   a component could not be restyled without hunting every file.

## Decision

One file, `src/theme/tokens.css`, is the only place a design decision is
written down. It contains, in order:

1. **Universal ramp** — heat colours, type families, radii, spacing, type ramp,
   motion durations/easings, structure (bar heights, column widths, blur,
   `--tap`, safe-area insets). Never themed.
2. **Personality blocks** — `:root`/`[data-theme='ember']`,
   `[data-theme='midnight']`, `[data-theme='ink']` (display name **Paper**).
   Each declares the same token names with that personality's values, plus the
   legacy aliases the older stylesheets still read.
3. **Global application** — body atmosphere, glass bars, theme cross-fade,
   reduced motion, forced colours.

`src/theme.css` no longer exists. `src/styles.css` no longer declares palette
values, so `main.tsx` no longer has a hidden ordering dependency.

### Consequences

- The contrast gate parses this file. `scripts/theme-contrast-check.ts` reads
  every `--name: #hex` inside a theme block, then measures a declared list of
  semantic pairs (`--text` on `--bg`, `--on-accent` on `--accent`, ...) for all
  three themes. A palette edit that breaks AA now fails the suite, and the
  measured values are the shipped ones by construction.
- Adding a token means adding it to all three blocks. A token present in only
  one block is a bug: `test:contrast` fails on missing tokens.
- Fonts are self-hosted with `local()` first, so a machine that has the family
  installed makes **no request**, and a machine that does not degrades to the
  OS stack rather than reaching for `fonts.googleapis.com`. The previous
  `@import` was both a rights-boundary violation and dead code — the families
  it named were never applied, because `theme.css` overrode `--display` and
  `--body` with different families.
- Themes stay a pure `<html data-theme>` token swap, so there is no layout
  shift, no remount, and a theme change can be wrapped in a View Transition.