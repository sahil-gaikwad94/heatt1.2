/* ============================================================
   HEATT · THEME RUNTIME

   The three personalities are *tokens*, not components: swapping
   <html data-theme> restyles every surface with no remount and no
   layout shift. This module owns the three facts a token file
   cannot know — the human-facing catalogue, the value of
   <meta name="theme-color">, and how a change animates.

   Who owns the state: App.tsx, in localStorage['heatt-state'].theme.
   This module never writes that object, so there is exactly one
   writer. index.html carries a duplicated no-flash boot script that
   reads the same field before first paint; keep the two in step.
   ============================================================ */

import { normalizeTheme, type ThemeId } from '../types'
import { prefersReducedMotion } from '../motion/tokens'

export type ThemePersonality = {
  id: ThemeId
  /** display name — the `ink` id is shown as "Paper" */
  name: string
  note: string
  description: string
  /** three real values from src/theme/tokens.css, for pickers and previews */
  swatches: [string, string, string]
  /** the colour of the phone's own chrome while this theme is active */
  chrome: string
  /** what makes this theme worth choosing, in one line, for /dev/kit */
  signature: string
}

export const THEMES: ThemePersonality[] = [
  {
    id: 'ember',
    name: 'Ember',
    note: 'Golden hour, every hour',
    description:
      'Warm porcelain daylight, heat-orange energy, soft gold. The default Heatt — bright, warm, quietly confident.',
    swatches: ['#f8f2ea', '#c2410c', '#8a6a1f'],
    chrome: '#f8f2ea',
    signature: 'Soft radial glow behind every surface; heat reads as firelight.',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    note: 'Deep focus after dark',
    description:
      'True black, one vivid lime reserved for action, soft cream text. For late reading and long attention.',
    swatches: ['#07080a', '#d8f25b', '#f2f4ee'],
    chrome: '#07080a',
    signature: 'Near-black depth with a single electric accent; glass navigation over content.',
  },
  {
    id: 'ink',
    name: 'Paper',
    note: 'Editorial minimalism',
    description:
      'Warm white, black ink, a whisper of khaki. Hairlines instead of shadows, and serif long-form reading.',
    swatches: ['#f7f6f3', '#1b1b18', '#6e6340'],
    chrome: '#f7f6f3',
    signature: 'Hairline structure, stat rows and black pill actions. Nothing louder than the words.',
  },
]

export function themeById(id: ThemeId): ThemePersonality {
  const theme = normalizeTheme(id)
  return THEMES.find(candidate => candidate.id === theme) ?? THEMES[0]
}

/** Reads the theme out of the durable object without importing App. */
export function readStoredTheme(): ThemeId {
  try {
    const raw = window.localStorage.getItem('heatt-state')
    if (!raw) return 'ember'
    const parsed = JSON.parse(raw) as { theme?: unknown }
    return normalizeTheme(parsed?.theme)
  } catch {
    return 'ember'
  }
}

function syncThemeColor(theme: ThemePersonality) {
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme.chrome)
}

/** Type-safe access to the View Transitions API across TS lib versions. */
type TransitionCapableDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> }
}

export type ThemeChangeOptions = {
  /**
   * Where the change came from, in viewport pixels. When present (and
   * motion is allowed and the browser supports View Transitions) the new
   * theme is revealed as a circle growing out of the control the reader
   * actually pressed — so the change has a visible cause.
   */
  origin?: { x: number; y: number }
  /** Overrides the runtime preference; used by /dev/kit and tests. */
  reduceMotion?: boolean
}

const REVEAL_MS = 900
const CROSSFADE_MS = 600

export function applyTheme(id: ThemeId, options: ThemeChangeOptions = {}) {
  const theme = themeById(id)
  const root = document.documentElement
  if (root.dataset.theme === theme.id) {
    syncThemeColor(theme)
    return
  }

  const commit = () => {
    root.dataset.theme = theme.id
    syncThemeColor(theme)
  }

  const reduced = options.reduceMotion ?? prefersReducedMotion()
  const canReveal =
    Boolean(options.origin) &&
    !reduced &&
    typeof (document as TransitionCapableDocument).startViewTransition === 'function'

  if (canReveal && options.origin) {
    root.style.setProperty('--reveal-x', `${Math.round(options.origin.x)}px`)
    root.style.setProperty('--reveal-y', `${Math.round(options.origin.y)}px`)
    root.classList.add('theme-reveal')
    window.setTimeout(() => root.classList.remove('theme-reveal'), REVEAL_MS)
    ;(document as TransitionCapableDocument).startViewTransition!(commit)
    return
  }

  if (reduced) {
    commit()
    return
  }

  root.classList.add('theme-transitioning')
  commit()
  window.setTimeout(() => root.classList.remove('theme-transitioning'), CROSSFADE_MS)
}

/** Convenience for pickers: turns any pointer/keyboard event into an origin. */
export function originFromEvent(event: unknown): { x: number; y: number } | undefined {
  if (!event || typeof event !== 'object') return undefined
  const candidate = event as { currentTarget?: unknown; clientX?: unknown; clientY?: unknown }
  if (typeof candidate.clientX === 'number' && typeof candidate.clientY === 'number') {
    const target = candidate.currentTarget as Element | null
    if (target && typeof target.getBoundingClientRect === 'function') {
      const box = target.getBoundingClientRect()
      return { x: box.left + box.width / 2, y: box.top + box.height / 2 }
    }
    return { x: candidate.clientX, y: candidate.clientY }
  }
  return undefined
}