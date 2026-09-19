import { useRef, useState, type ReactNode } from 'react'
import { originFromEvent, THEMES } from '../theme/theme'
import type { ThemeId } from '../types'

/* ============================================================
   /dev/kit — the living reference for src/ui/design-system.css

   So a new screen can be assembled from pieces already proven in all
   three personalities, and so a palette change is visible at once
   instead of hunted across seventeen stylesheets.

   Nothing here is decorative fiction: the numerals, counters and
   waypoints demonstrate AGENTS.md §2 — no fabricated activity, no
   percentage targets, no streaks.
   ============================================================ */

function Section({ id, title, note, children }: { id: string; title: string; note: string; children: ReactNode }) {
  return (
    <section className="ds-stack" aria-labelledby={`kit-${id}`}>
      <div className="ds-stack ds-stack--tight">
        <p className="ds-eyebrow">{id.replace(/-/g, ' ')}</p>
        <h2 id={`kit-${id}`} className="ds-card-title ds-card-title--sm">{title}</h2>
        <p className="ds-copy">{note}</p>
      </div>
      {children}
    </section>
  )
}

export function KitPage({ theme, onThemeChange }: {
  theme: ThemeId
  onThemeChange: (theme: ThemeId, origin?: { x: number; y: number }) => void
}) {
  const sheetRef = useRef<HTMLDialogElement>(null)
  const [shelf, setShelf] = useState('Books & ideas')
  const [kind, setKind] = useState('Thought')
  const [pressed, setPressed] = useState(false)
  const [waypoints, setWaypoints] = useState(3)
  const active = THEMES.find(item => item.id === theme) ?? THEMES[0]

  return (
    <div className="page-content ds-stack" style={{ maxWidth: 'var(--content-max)', marginInline: 'auto', gap: 'var(--s-7)' }}>
      <header className="ds-stack ds-stack--tight">
        <p className="ds-eyebrow">heatt · design system</p>
        <h1 className="ds-card-title">The kit.</h1>
        <p className="ds-lede">
          Nine component families, three personalities, one token file. Every control here is reachable
          by keyboard and at least 44px tall.
        </p>
      </header>

      <Section
        id="theme"
        title="Personalities"
        note="Choosing a theme moves one attribute on the html element. Where View Transitions exist the new atmosphere is revealed as a circle growing out of the chip you pressed; otherwise it cross-fades. Nothing remounts, so nothing shifts."
      >
        <div className="ds-chip-row" role="radiogroup" aria-label="Theme">
          {THEMES.map(item => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={theme === item.id}
              aria-pressed={theme === item.id}
              className="ds-chip"
              onClick={event => onThemeChange(item.id, originFromEvent(event))}
            >
              {item.name}
              <small>{item.id}</small>
            </button>
          ))}
        </div>
        <div className="ds-card">
          <div className="ds-stack ds-stack--tight">
            <strong className="ds-card-title ds-card-title--sm">{active.name} — {active.note}</strong>
            <p className="ds-copy">{active.description}</p>
            <p className="ds-copy">{active.signature}</p>
          </div>
          <div className="ds-cluster" style={{ marginBlockStart: 'var(--s-4)' }}>
            {active.swatches.map(color => (
              <span key={color} className="ds-cluster" style={{ gap: 'var(--s-2)' }}>
                <span
                  aria-hidden="true"
                  style={{
                    inlineSize: 26,
                    blockSize: 26,
                    borderRadius: 'var(--r-xs)',
                    background: color,
                    border: 'var(--hairline) solid var(--line)',
                  }}
                />
                <code className="ds-eyebrow">{color}</code>
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="actions"
        title="Actions"
        note="One primary action per screen, in the theme's own accent — Paper's is the black pill, Midnight's the lime one. Everything else is quiet, ghost, or an icon button that carries a label."
      >
        <div className="ds-cluster">
          <button type="button" className="ds-btn ds-btn--primary">Share a thought</button>
          <button type="button" className="ds-btn ds-btn--quiet">Save source</button>
          <button type="button" className="ds-btn ds-btn--ghost">Why this?</button>
          <button type="button" className="ds-btn ds-btn--primary ds-btn--sm">Small</button>
          <button type="button" className="ds-icon-btn ds-icon-btn--quiet" aria-label="Tune your feed">≡</button>
          <button type="button" className="ds-btn ds-btn--quiet" disabled>Unavailable</button>
        </div>
        <div className="ds-card ds-card--on-ink">
          <p className="ds-copy ds-copy--on-ink">
            On the dark panel, actions switch to the on-ink variants so contrast holds in every theme.
          </p>
          <div className="ds-cluster" style={{ marginBlockStart: 'var(--s-4)' }}>
            <button type="button" className="ds-btn ds-btn--on-ink">Read more</button>
            <button type="button" className="ds-btn ds-btn--primary">Download</button>
          </div>
        </div>
      </Section>

      <Section
        id="chips"
        title="Chips, shelves and segments"
        note="A dashed chip means not chosen yet, and choosing is cheap. A chosen chip becomes solid, because a decision should look settled. This is the shelf filter and the composer's type picker."
      >
        <div className="ds-chip-row">
          <span className="ds-chip-row-label">Shelves</span>
          {['Books & ideas', 'Poetry & language', 'Making & craft', 'Philosophy'].map(item => (
            <button
              key={item}
              type="button"
              className="ds-chip"
              aria-pressed={shelf === item}
              onClick={() => setShelf(item)}
            >
              {item}
            </button>
          ))}
          <button
            type="button"
            className="ds-chip ds-chip--solid"
            aria-pressed={pressed}
            onClick={() => setPressed(!pressed)}
          >
            Heat <small>3</small>
          </button>
        </div>
        <div className="ds-segmented" role="tablist" aria-label="Composer type">
          {['Thought', 'Question', 'Practice', 'Poem'].map(item => (
            <button key={item} type="button" role="tab" aria-selected={kind === item} onClick={() => setKind(item)}>
              {item}
            </button>
          ))}
        </div>
        <p className="ds-copy">Composing a <strong>{kind.toLowerCase()}</strong> into the shelf <strong>{shelf}</strong>.</p>
      </Section>

      <Section
        id="surfaces"
        title="Surfaces"
        note="Cards carry the reference study language: 28px radius, a hero wash of two radial glows, and glass where content scrolls beneath. Paper replaces shadows with hairlines; Midnight keeps the lime for action only."
      >
        <div className="ds-card ds-card--hero">
          <p className="ds-eyebrow">hero wash</p>
          <h3 className="ds-card-title">Where your mind catches fire.</h3>
          <p className="ds-copy" style={{ marginBlockStart: 'var(--s-2)' }}>
            Two radial washes over the panel — the same construction as the reference dashboard, in Heatt's palette.
          </p>
        </div>
        <div className="ds-cluster" style={{ alignItems: 'stretch' }}>
          <div className="ds-card ds-card--tight ds-grow">
            <p className="ds-eyebrow">tight</p>
            <p className="ds-copy">Compact card for dense lists.</p>
          </div>
          <div className="ds-card ds-card--tight ds-card--soft ds-grow">
            <p className="ds-eyebrow">soft</p>
            <p className="ds-copy">Recessed surface, no shadow.</p>
          </div>
        </div>
        <div className="ds-card ds-card--glass">
          <p className="ds-eyebrow">glass</p>
          <p className="ds-copy">The material of the app bar, the tab bar and the sheet.</p>
        </div>
      </Section>

      <Section
        id="numerals"
        title="Numerals, orbs and stat rows"
        note="One big soft number answers the only question a screen asks. The ring and the waypoints below are deliberately targetless: they can only ever grow, and they never convert into a percentage or a score."
      >
        <div className="ds-card ds-card--hero ds-cluster" style={{ justifyContent: 'space-between' }}>
          <div className="ds-orb ds-orb--lg">
            <svg className="ds-ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle className="track" cx="50" cy="50" r="46" />
              <circle
                className="value"
                cx="50"
                cy="50"
                r="46"
                style={{ strokeDasharray: `${Math.min(waypoints, 12) * 24} 999` }}
              />
            </svg>
            <div className="ds-orb-content">
              <p className="ds-numeral">{waypoints}</p>
              <p className="ds-eyebrow">flares written</p>
            </div>
          </div>
          <div className="ds-stack ds-stack--tight ds-grow" style={{ minWidth: 200 }}>
            <p className="ds-eyebrow">waypoints</p>
            <div className="ds-waypoints">
              {Array.from({ length: 8 }, (_, index) => (
                <span
                  key={index}
                  className={index < Math.min(waypoints, 8) ? 'ds-waypoint ds-waypoint--reached' : 'ds-waypoint'}
                >
                  {index + 1}
                </span>
              ))}
            </div>
            <div className="ds-cluster">
              <button
                type="button"
                className="ds-btn ds-btn--quiet ds-btn--sm"
                onClick={() => setWaypoints(current => current + 1)}
              >
                Add one
              </button>
              <span className="ds-copy">Counters here only ever increase.</span>
            </div>
          </div>
        </div>
        <div className="ds-stats">
          <div className="ds-stat"><strong>18</strong><span>heats given</span></div>
          <div className="ds-stat"><strong>53</strong><span>sources kept</span></div>
          <div className="ds-stat"><strong>4</strong><span>rooms joined</span></div>
        </div>
        <p className="ds-copy">Sample figures for the pattern only — the kit is not claiming activity.</p>
      </Section>

      <Section
        id="rows"
        title="Rows and lists"
        note="Mark, two lines, trailing action. The workhorse of Rooms, Journal, the source list and settings. Real buttons, 44px minimum, and the whole row is the target."
      >
        <div className="ds-card ds-card--flush">
          <div style={{ padding: 'var(--s-2) var(--s-4)' }}>
            {[
              { mark: 'BK', title: 'Books & ideas', meta: '12 sources · kindling' },
              { mark: 'PL', title: 'Poetry & language', meta: '4 sources · read softly' },
              { mark: 'MC', title: 'Making & craft', meta: '7 sources · slow work' },
            ].map(row => (
              <button key={row.mark} type="button" className="ds-row">
                <span className="ds-mark" aria-hidden="true">{row.mark}</span>
                <span className="ds-row-body">
                  <span className="ds-row-title">{row.title}</span>
                  <span className="ds-row-meta">{row.meta}</span>
                </span>
                <span className="ds-chip ds-chip--solid ds-chip--on-ink" aria-hidden="true">Open</span>
              </button>
            ))}
          </div>
        </div>
        <div className="ds-cluster">
          <span className="ds-avatar" aria-hidden="true">GR</span>
          <span className="ds-avatar ds-avatar--sm" aria-hidden="true">DU</span>
          <span className="ds-avatar ds-avatar--lg" aria-hidden="true">HE</span>
        </div>
      </Section>

      <Section
        id="sheet"
        title="Sheets"
        note="Built on a real dialog element, so the browser supplies the focus trap, Escape and background inertness. In the app a sheet is query state (?sheet=tuner), which means the phone's back gesture closes it."
      >
        <div className="ds-cluster">
          <button type="button" className="ds-btn ds-btn--primary" onClick={() => sheetRef.current?.showModal()}>
            Open a sheet
          </button>
          <span className="ds-copy">Try Escape, then Tab — both behave because the browser is doing it.</span>
        </div>
        <dialog ref={sheetRef} className="ds-sheet" aria-labelledby="kit-sheet-title">
          <div className="ds-sheet-panel">
            <span className="ds-sheet-grabber" aria-hidden="true" />
            <div className="ds-sheet-head">
              <div className="ds-stack ds-stack--tight ds-grow">
                <p className="ds-eyebrow">feed tuner</p>
                <h3 id="kit-sheet-title" className="ds-sheet-title">Tune what reaches you.</h3>
                <p className="ds-copy">Sheets stay short, state what they change, and never hide the way out.</p>
              </div>
              <button type="button" className="ds-icon-btn" aria-label="Close" onClick={() => sheetRef.current?.close()}>×</button>
            </div>
            <div className="ds-cluster">
              <button type="button" className="ds-chip" aria-pressed>Less of the same</button>
              <button type="button" className="ds-chip">More like this</button>
            </div>
            <button type="button" className="ds-btn ds-btn--primary ds-btn--block" onClick={() => sheetRef.current?.close()}>
              Done
            </button>
          </div>
        </dialog>
      </Section>

      <Section
        id="states"
        title="Loading, empty and invitation"
        note="Every screen has loading, empty, error and retry states (AGENTS.md §2.10). An empty state is an invitation, never an error, and skeletons keep the shape of what is coming so nothing jumps."
      >
        <div className="ds-card ds-stack ds-stack--tight">
          <span className="ds-skeleton ds-skeleton--title" />
          <span className="ds-skeleton ds-skeleton--line" />
          <span className="ds-skeleton ds-skeleton--line" style={{ inlineSize: '78%' }} />
          <span className="ds-skeleton ds-skeleton--block" />
        </div>
        <div className="ds-empty">
          <span className="ds-empty-icon" aria-hidden="true">✦</span>
          <p className="ds-empty-title">Nothing here yet — and that is fine.</p>
          <p className="ds-copy">Nothing has been kept in this shelf. Add the first source whenever it finds you.</p>
          <button type="button" className="ds-btn ds-btn--quiet ds-btn--sm">Browse the open web</button>
        </div>
        <div className="ds-card ds-live" role="status" aria-live="polite">
          Kindling more good reads…
        </div>
      </Section>

      <Section
        id="type"
        title="Typography"
        note="Sans for the app, serif for long-form reading, mono for metadata and eyebrows. Display sizes use clamp() so a phone never gets a desktop headline."
      >
        <div className="ds-stack">
          <p className="ds-eyebrow">eyebrow · mono · 10px</p>
          <p className="ds-card-title">Display — where your mind catches fire</p>
          <p className="ds-lede">Lede — a quieter place for worthwhile ideas.</p>
          <p className="ds-copy">Body copy at 13px, the default for UI text.</p>
          <p className="ds-read">
            Reading copy is serif and set to 1.72 line-height, because a paragraph of another person's
            work deserves the treatment a book gets.
          </p>
          <p className="ds-copy" style={{ fontFamily: 'var(--font-mono)' }}>mono · 53 sources · 13 shelves</p>
        </div>
      </Section>

      <footer className="ds-stack ds-stack--tight" style={{ paddingBlockEnd: 'var(--s-8)' }}>
        <hr className="ds-hairline" />
        <p className="ds-copy">
          Tokens: <code>src/theme/tokens.css</code> · components: <code>src/ui/design-system.css</code> ·
          motion: <code>src/motion/tokens.ts</code> · rationale: <code>docs/decisions/0007-theme-tokens.md</code>.
        </p>
        <p className="ds-copy">
          The contrast gate (<code>npm run test:contrast</code>) parses the token file and measures 54 real
          pairs across the three themes, so a palette edit cannot quietly break a label.
        </p>
      </footer>
    </div>
  )
}