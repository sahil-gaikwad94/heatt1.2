/* ============================================================
   THEME CONTRAST GATE

   This script used to assert eleven hardcoded hex pairs that no
   longer existed in any stylesheet — it passed while measuring
   nothing. It now parses src/theme/tokens.css, so the values it
   measures ARE the values that ship.

   It fails when:
     - a theme is missing a token that another theme declares,
     - a measured token is not a literal colour (indirection would
       quietly weaken the gate, which is the bug this replaces),
     - any pair is below WCAG 2.2 AA: 4.5:1 text, 3:1 UI.
   ============================================================ */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const tokensPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'theme', 'tokens.css')
const css = readFileSync(tokensPath, 'utf8')

/** Comments are stripped so a commented-out value can never satisfy a token. */
const source = css.replace(/\/\*[\s\S]*?\*\//g, '')

type Block = { selector: string; tokens: Map<string, string> }

function parseBlocks(input: string): Block[] {
  const blocks: Block[] = []
  const pattern = /([^{}]+)\{([^{}]*)\}/g
  let match: RegExpExecArray | null = pattern.exec(input)
  while (match !== null) {
    const selector = match[1].replace(/\s+/g, ' ').trim()
    const tokens = new Map<string, string>()
    for (const declaration of match[2].split(';')) {
      const found = declaration.match(/(--[a-z0-9-]+)\s*:\s*(.+)/i)
      if (found) tokens.set(found[1].trim(), found[2].trim())
    }
    if (tokens.size) blocks.push({ selector, tokens })
    match = pattern.exec(input)
  }
  return blocks
}

const blocks = parseBlocks(source)

function blockFor(needle: string): Block {
  const found = blocks.find(block => block.selector.includes(needle))
  if (!found) throw new Error(`tokens.css: no theme block found for ${needle}`)
  return found
}

/** The universal ramp applies to every theme; each personality overrides it. */
const ramp = blockFor(':root')

const THEMES = [
  { label: 'Ember', personality: blockFor("data-theme='ember'") },
  { label: 'Midnight', personality: blockFor("data-theme='midnight'") },
  { label: 'Paper', personality: blockFor("data-theme='ink'") },
]

type Palette = Map<string, string>

const palettes: Palette[] = THEMES.map(theme => {
  const merged: Palette = new Map(ramp.tokens)
  for (const [name, value] of theme.personality.tokens) merged.set(name, value)
  return merged
})

/* ---------- parity: a token in one theme must exist in all ---------- */
const reference = THEMES[0].personality.tokens
for (let index = 1; index < THEMES.length; index += 1) {
  const theme = THEMES[index]
  const names = theme.personality.tokens
  const missing = [...reference.keys()].filter(name => !names.has(name))
  const extra = [...names.keys()].filter(name => !reference.has(name))
  if (missing.length) throw new Error(`${theme.label} is missing tokens: ${missing.join(', ')}`)
  if (extra.length) throw new Error(`${theme.label} declares tokens no other theme declares: ${extra.join(', ')}`)
}
console.log(`Token parity: ${reference.size} tokens declared by all ${THEMES.length} themes.`)

/* ---------- colour parsing ---------- */
type Rgba = { r: number; g: number; b: number; a: number }

function parseColor(value: string, name: string, theme: string): Rgba {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    const digits = hex[1].length === 3 ? hex[1].replace(/./g, char => char + char) : hex[1]
    return {
      r: Number.parseInt(digits.slice(0, 2), 16),
      g: Number.parseInt(digits.slice(2, 4), 16),
      b: Number.parseInt(digits.slice(4, 6), 16),
      a: 1,
    }
  }
  const rgba = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/i)
  if (rgba) {
    return {
      r: Number(rgba[1]),
      g: Number(rgba[2]),
      b: Number(rgba[3]),
      a: rgba[4] === undefined ? 1 : Number(rgba[4]),
    }
  }
  throw new Error(
    `${theme}: ${name} is "${value}" — not a literal colour. The gate can only measure literals, so keep ` +
      'measured tokens literal in src/theme/tokens.css instead of pointing them at another token.',
  )
}

/** Flatten a translucent colour onto the surface behind it. */
function over(foreground: Rgba, background: Rgba): Rgba {
  if (foreground.a >= 1) return foreground
  return {
    r: foreground.r * foreground.a + background.r * (1 - foreground.a),
    g: foreground.g * foreground.a + background.g * (1 - foreground.a),
    b: foreground.b * foreground.a + background.b * (1 - foreground.a),
    a: 1,
  }
}

function luminance(color: Rgba) {
  const channels = [color.r, color.g, color.b]
    .map(value => value / 255)
    .map(value => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function ratio(foreground: Rgba, background: Rgba) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

/* ---------- the pairs that actually ship ---------- */
type Pair = { label: string; fg: string; bg: string; behind?: string; min?: number }

const PAIRS: Pair[] = [
  { label: 'body text on the app background', fg: '--text', bg: '--bg' },
  { label: 'secondary copy on the app background', fg: '--copy', bg: '--bg' },
  { label: 'meta text on the app background', fg: '--muted', bg: '--bg' },
  { label: 'body text on a card', fg: '--text', bg: '--panel' },
  { label: 'secondary copy on a card', fg: '--copy', bg: '--panel' },
  { label: 'meta text on a card', fg: '--muted', bg: '--panel' },
  { label: 'secondary copy on a soft surface', fg: '--copy', bg: '--panel-soft' },
  { label: 'meta text on a soft surface', fg: '--muted', bg: '--panel-soft' },
  { label: 'primary action label', fg: '--on-accent', bg: '--accent' },
  { label: 'accent on the background (icons, borders)', fg: '--accent', bg: '--bg', min: 3 },
  { label: 'accent on a card (icons, borders)', fg: '--accent', bg: '--panel', min: 3 },
  { label: 'eyebrow gold on a card', fg: '--gold', bg: '--panel' },
  { label: 'chip label, unselected', fg: '--chip-text', bg: '--chip-bg', behind: '--bg' },
  { label: 'chip label, selected', fg: '--chip-text-active', bg: '--chip-bg-active' },
  { label: 'numeral on a card', fg: '--numeral', bg: '--panel' },
  { label: 'text on the dark panel', fg: '--panel-ink-text', bg: '--panel-ink' },
  { label: 'copy on the dark panel', fg: '--panel-ink-copy', bg: '--panel-ink' },
  { label: 'toast text on the toast surface', fg: '--on-accent', bg: '--accent-strong' },
]

const OK = ' ok '
let measured = 0
const failures: string[] = []

for (let index = 0; index < THEMES.length; index += 1) {
  const theme = THEMES[index]
  const palette = palettes[index]
  console.log(`\n${theme.label} — ${theme.personality.selector}`)
  for (const pair of PAIRS) {
    const fgValue = palette.get(pair.fg)
    const bgValue = palette.get(pair.bg)
    if (!fgValue || !bgValue) throw new Error(`${theme.label}: unknown token in pair "${pair.label}"`)
    const minimum = pair.min ?? 4.5
    const behind = parseColor(
      pair.behind ? palette.get(pair.behind) ?? '' : bgValue,
      pair.behind ?? pair.bg,
      theme.label,
    )
    const background = over(parseColor(bgValue, pair.bg, theme.label), behind)
    const foreground = over(parseColor(fgValue, pair.fg, theme.label), background)
    const value = ratio(foreground, background)
    measured += 1
    const passed = value >= minimum
    if (!passed) failures.push(`${theme.label} · ${pair.label}: ${value.toFixed(2)}:1 (needs ${minimum}:1)`)
    console.log(
      `${passed ? OK : 'FAIL'} ${pair.label.padEnd(44, '.')} ${value.toFixed(2)}:1  (${pair.fg} on ${pair.bg})`,
    )
  }
}

if (failures.length) {
  console.error(`\n${failures.length} of ${measured} measured pairs fail WCAG AA:`)
  for (const failure of failures) console.error(` - ${failure}`)
  process.exitCode = 1
  throw new Error(`Theme contrast gate failed (${failures.length} pairs).`)
}

console.log(
  `\nTheme contrast checks passed: ${measured} measured pairs across ${THEMES.length} themes, read from ` +
    'src/theme/tokens.css.',
)
