/* ============================================================
   HEATT · MOTION TOKENS

   The numeric half of the motion contract in AGENTS.md §7.
   Mirrors --dur-* / --ease-* in src/theme/tokens.css: change one,
   change both, in the same commit.

   Nothing here animates by itself. It only names the values so a
   component cannot invent its own timing, and tells you whether
   motion is allowed at all right now.
   ============================================================ */

export const duration = {
  /** state flips that must feel instant — presses, checks */
  instant: 0.12,
  /** hover, focus, small reveals */
  quick: 0.2,
  /** screen and sheet transitions */
  base: 0.32,
  /** atmosphere changes and long cross-fades */
  slow: 0.52,
} as const

export const ease = {
  /** entering: fast out, soft settle. The house curve. */
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  /** symmetric movement */
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  /** playful overshoot, only for taps */
  spring: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
} as const

export const spring = {
  press: { type: 'spring', stiffness: 380, damping: 26 },
  gentle: { type: 'spring', stiffness: 190, damping: 24 },
  sheet: { type: 'spring', stiffness: 300, damping: 32 },
} as const

/** how far things travel. Small on purpose — this is an app, not a show. */
export const distance = {
  rise: 14,
  lift: 4,
  sheet: 28,
} as const

/**
 * The in-app override. `system` defers to the OS; `reduced` adds stillness on
 * top of it. There is deliberately no `full` mode: a reader whose OS asks for
 * less motion must never be given more, so the override can only ever reduce
 * (ADR 0002).
 */
export type MotionMode = 'system' | 'reduced'

/** The in-app override. `system` is the default and defers to the OS. */
export const MOTION_KEY = 'heatt-motion'

export function isMotionMode(value: unknown): value is MotionMode {
  return value === 'system' || value === 'reduced'
}

export function readMotionMode(): MotionMode {
  try {
    const stored = window.localStorage.getItem(MOTION_KEY)
    return isMotionMode(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

/** Mirrors the mode onto <html data-motion> so CSS can honour it too. */
export function applyMotionMode(mode: MotionMode) {
  const root = document.documentElement
  if (mode === 'system') root.removeAttribute('data-motion')
  else root.setAttribute('data-motion', mode)
}

export function writeMotionMode(mode: MotionMode) {
  try {
    if (mode === 'system') window.localStorage.removeItem(MOTION_KEY)
    else window.localStorage.setItem(MOTION_KEY, mode)
  } catch {
    /* storage blocked — the DOM mirror below still applies for this session */
  }
  applyMotionMode(mode)
}

/**
 * The single question every animated component must ask. The in-app override
 * wins in one direction only — it can always add stillness, and can never
 * remove it: choosing `system` while the OS asks for reduced motion still
 * reduces (ADR 0002).
 */
export function prefersReducedMotion(mode: MotionMode = readMotionMode()): boolean {
  if (mode === 'reduced') return true
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Values for MotionConfig, kept in step with the rule above. */
export function motionConfigFor() {
  return { reducedMotion: (readMotionMode() === 'reduced' ? 'always' : 'user') as 'always' | 'user' }
}