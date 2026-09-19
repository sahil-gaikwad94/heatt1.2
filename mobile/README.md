# Heatt (mobile)

A mobile-first, text-first social reading & writing app — "where your mind
catches fire." Built with Expo (React Native), Expo Router, Reanimated, Gesture
Handler, SVG, and Linear Gradient. Runs natively on iOS/Android and in the
browser via Expo web (the preview surface).

## Themes
Three personalities of one product, drawn from the reference boards:
- **Ember** — sunrise glass (light, luminous). Companion: Kindle. Signature: the Heat Orb.
- **Midnight** — aubergine night + filament amber accent (dark). Companion: Dusk. Signature: notched cards, filled-circle pill nav.
- **Paper** — the reading room (editorial monochrome). Companion: Ink. Signature: stat trio, S/M/L text control.

Switch live in Settings → Atmosphere, or during onboarding.

## Run
```
cd mobile
npm install
npx expo start --web      # browser preview
npx expo start            # device / simulator (Expo Go)
```

## Structure
- `app/` — Expo Router routes (tabs, detail screens, onboarding).
- `src/theme/` — token-driven theme system + provider.
- `src/state/` — local-first store (AsyncStorage), seeded from the real catalog.
- `src/ui/` — design-system primitives (Text, Pressables, Card, Sheet, TabBar, HeatButton…).
- `src/features/` — composed pieces (HeatOrb, Companion, ShareSheet, ThemePicker…).
- `src/data/` — the 53-publisher catalog + wisdom, as flares.
- `src/motion/` — motion tokens + haptics.
