# Heatt · zero-install visual preview

This folder exists because the machine that built these themes has **no Node,
no npm, no `node_modules` and no `dist`** — so `npm run dev` cannot run here.
It does have **Python 3.13**, and it always has a browser. That is enough to
see the real thing.

## Look at it

**Option 1 — double-click.** Open `preview/index.html` in any browser. Nothing
to install, nothing to start.

**Option 2 — serve it (recommended on Windows if a browser refuses local CSS).**

```
python -m http.server 8000
```

Run that from the repository root, then open
<http://localhost:8000/preview/>. Or just double-click `preview/serve.cmd`,
which does the same thing and tells you the address.

## What you are looking at

`index.html` links the **shipped** stylesheets:

| File | Why it is the real thing |
|---|---|
| `../src/theme/tokens.css` | The single source of truth for all three palettes |
| `../src/ui/design-system.css` | The `ds-*` component layer the app builds screens from |

There is no copy of any colour in this folder. `preview.css` only declares
layout, and every class in it is prefixed `pv-` so it can never collide with
the product namespace. Edit a token and this page changes with it.

The three chips in the top bar switch the same attribute the app switches —
`<html data-theme>` — so what you see is the exact mechanism the app uses, not
a mock of it. If you have used the app before, the preview even opens on the
theme you last chose, because it reads the same `heatt-state` key
`index.html`'s no-flash boot script reads.

## What it demonstrates

- the soft-glow hero with the waypoint orb and tabular numerals,
- one vivid accent per personality, used once per screen,
- dashed chips that settle into solid when chosen,
- the editorial stat row, hairline rules and black pill actions,
- the floating glass tab bar over content,
- the inverted journal panel and its Paper-specific focus ring,
- loading skeletons and an empty state that is an invitation,
- keyboard access everywhere: tab through it, the focus ring is deliberate.

## Honest limits

- **These are specimens, not screens.** The real screens are in
  `src/App.tsx` and still carry the older product CSS in `src/styles.css`.
  The `ds-*` layer is what new work is built from.
- **The self-hosted fonts are not in the repo yet.** `public/fonts/` holds only
  a README, so `@font-face` falls through `local()` to the OS stack. The
  preview looks slightly different from a build that ships the `.woff2` files.
  See `public/fonts/README.md`.
- **The typography is not final** until those files land — the design is
  deliberately tuned to survive the fallback stack.
