/* ============================================================
   HEATT · ROUTER

   A ~100-line History API router. This replaces `useState<Page>`
   plus ad-hoc `window.location.pathname` checks in the render body
   (see docs/decisions/0004-router.md).

   Why not a router library: Heatt has twelve flat routes, no data
   loaders, no nested layouts and no code splitting yet. A library
   would cost KB and a dependency-policy ADR (AGENTS.md §9) to
   provide history, which the platform already provides.

   What actually matters and is implemented here:
     - the URL is the source of truth for which screen is visible,
     - back and forward restore the screen *and* the scroll position,
       because a feed that jumps to the top on back is broken,
     - unknown paths fall back instead of rendering nothing,
     - the same path resolves identically on a cold load and a
       client navigation, so a shared link opens the right screen.
   ============================================================ */

import { useEffect, useState } from 'react'

export type Page =
  | 'landing'
  | 'home'
  | 'rooms'
  | 'create'
  | 'journal'
  | 'wisdom'
  | 'profile'
  | 'settings'
  | 'admin'

/** Screens that exist as a public, shareable URL. */
export const PAGE_PATHS: Record<Page, string> = {
  landing: '/welcome',
  home: '/',
  rooms: '/rooms',
  create: '/create',
  journal: '/journal',
  wisdom: '/wisdom',
  profile: '/you',
  settings: '/settings',
  admin: '/admin',
}

/** Pages that make sense to restore on a cold load of a deep link. */
const RESTORABLE: Page[] = ['rooms', 'journal', 'wisdom', 'profile', 'settings', 'create', 'landing']

export function pathForPage(page: Page): string {
  return PAGE_PATHS[page] ?? '/'
}

export function parsePage(pathname: string): Page {
  const clean = pathname.replace(/\/+$/, '') || '/'
  const match = (Object.keys(PAGE_PATHS) as Page[]).find(page => PAGE_PATHS[page] === clean)
  if (match && RESTORABLE.includes(match)) return match
  return 'home'
}

/** Extra history state: the scroll position we must return to on back. */
type HistoryState = { heatt: true; page: Page; scrollY?: number }

function pushState(page: Page, options: { replace?: boolean; scrollY?: number } = {}) {
  const state: HistoryState = { heatt: true, page, scrollY: options.scrollY ?? 0 }
  const url = pathForPage(page)
  if (options.replace) {
    window.history.replaceState(state, '', url)
    return
  }
  /* Remember where the reader was, on the entry they are leaving, so back
     returns them to the same offset instead of the top of the page. */
  const current = window.history.state as HistoryState | null
  if (current?.heatt) {
    window.history.replaceState(
      { ...current, scrollY: window.scrollY },
      '',
      `${window.location.pathname}${window.location.search}`,
    )
  }
  window.history.pushState(state, '', url)
}

export function navigate(page: Page, options: { replace?: boolean; scrollY?: number } = {}) {
  pushState(page, options)
  /* The URL changed from our own code, so no popstate fires and nothing
     would re-render. Notify the same listeners popstate would. */
  window.dispatchEvent(new Event('heatt:navigate'))
}

/** The raw pathname, kept in step with the URL. It re-renders on every
 *  change, so public routes (/explore/:category, /privacy, /terms, /admin,
 *  /dev/kit) resolve reactively instead of needing a page reload. */
export function useRoutePath(): string {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const sync = () => {
      const state = window.history.state as HistoryState | null
      setPath(window.location.pathname)
      /* Restore scroll only when returning to a screen we left, never on a
         fresh push — otherwise every forward navigation would scroll to an
         arbitrary offset. */
      const target = state?.heatt ? state.scrollY : undefined
      if (typeof target === 'number') window.requestAnimationFrame(() => window.scrollTo(0, target))
    }
    window.addEventListener('popstate', sync)
    window.addEventListener('heatt:navigate', sync)
    if (!(window.history.state as HistoryState | null)?.heatt) {
      window.history.replaceState(
        { heatt: true, page: parsePage(window.location.pathname), scrollY: 0 },
        '',
        `${window.location.pathname}${window.location.search}`,
      )
    }
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('heatt:navigate', sync)
    }
  }, [])

  return path
}

/**
 * Sheets and modals are query state (`?sheet=tuner`) so the system back
 * gesture closes the topmost layer and the layer is deep-linkable
 * (AGENTS.md §6). Opening pushes an entry carrying the *current* scroll
 * offset, so closing with back cannot jump the page to the top; closing
 * programmatically pops that entry, leaving the back stack clean.
 */
export function readSheet(): string | null {
  return new URLSearchParams(window.location.search).get('sheet')
}

export function setSheet(name: string | null) {
  const url = new URL(window.location.href)
  if (!name) {
    if (readSheet()) window.history.back()
    return
  }
  url.searchParams.set('sheet', name)
  window.history.pushState(
    { heatt: true, page: parsePage(url.pathname), scrollY: window.scrollY } satisfies HistoryState,
    '',
    `${url.pathname}${url.search}`,
  )
}