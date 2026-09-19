# Self-hosted fonts

`src/theme/tokens.css` declares three `@font-face` rules whose `src` lists a
`local()` name **first** and a `/fonts/*.woff2` file second:

| Family | Token | Expected file |
|---|---|---|
| Inter | `--font-display`, `--font-body` | `inter-variable.woff2` |
| Playfair Display | `--font-read` | `playfair-display-variable.woff2` |
| JetBrains Mono | `--font-mono` | `jetbrains-mono-variable.woff2` |

Two consequences worth knowing:

1. **A machine that already has the family installed makes no request at all** —
   `local()` wins before the URL is ever considered. So the app never depends on
   the files being present to look right on a developer machine.
2. **If the files are missing and the family is not installed**, the browser
   falls back down the stack in the token (`SF Pro Display`, `Segoe UI`,
   `Roboto`, `Helvetica Neue`, `Arial`, …). Nothing 404-loops and nothing blocks
   first paint: `font-display: swap` is set on all three.

To ship the intended typography, drop the variable binaries here with exactly
those file names. Inter, Playfair Display and JetBrains Mono are all SIL Open
Font License, which permits redistribution inside an application bundle; keep
their `OFL.txt` alongside the files.

**Why not Google Fonts.** `src/styles.css` used to begin with
`@import url('https://fonts.googleapis.com/...')`. It violated the rights
boundary in AGENTS.md §3 (no undeclared third-party runtime request) *and* was
dead code: the families it named were immediately overridden by a different set
in `src/theme.css`, so the request was made and thrown away. See
`docs/decisions/0007-theme-tokens.md`.
