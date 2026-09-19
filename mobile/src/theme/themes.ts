/**
 * Heatt theme system — three personalities of one product, drawn from the
 * reference boards:
 *   Ember    → sunrise glass (light, luminous, warm)   · companion Kindle
 *   Midnight → aubergine night + filament accent (dark) · companion Dusk
 *   Paper    → the reading room (editorial monochrome)  · companion Ink
 *
 * These are semantic tokens: every theme defines every token, so components
 * never fork per-theme except for deliberate structural variants.
 */

export type ThemeId = 'ember' | 'midnight' | 'paper';

export type ThemeTokens = {
  id: ThemeId;
  name: string;
  companion: string;
  scheme: 'light' | 'dark';

  // Surfaces
  bg: string;
  bgElevated: string;
  surface: string;
  surface2: string;
  surfaceGlass: string; // translucent card fill
  glassBorder: string;

  // Gradient mesh blobs (Ember hero background / accents elsewhere)
  mesh: [string, string, string, string];

  // Lines
  border: string;
  borderStrong: string;

  // Text
  text: string;
  text2: string;
  text3: string;

  // Accent
  accent: string; // icons, outlines
  accentStrong: string; // filled buttons
  onAccent: string; // text on accentStrong / accent chips

  // Heat ramp (1 -> 3)
  heat1: string;
  heat2: string;
  heat3: string;

  // Meaning
  highlight: string;
  success: string;
  danger: string;
  focus: string;

  // Tab bar chrome
  navBar: string; // floating pill bg
  navBorder: string;
  navActive: string; // active pill/circle
  navActiveText: string; // icon color on active
  navInactive: string; // inactive icon color

  // Radii
  rSm: number;
  rMd: number;
  rLg: number;
  rXl: number;
  rPill: number;

  // Shadow (used via elevation helper)
  shadowColor: string;
  shadowOpacity: number;

  // Fonts (system stacks for now; swap for self-hosted later)
  fontDisplay: string;
  fontUI: string;
  fontRead: string;

  // Motion personality
  spring: { damping: number; stiffness: number; mass: number };
  overshoot: number; // tap scale target multiplier hint
};

const shared = {
  rSm: 12,
  rMd: 18,
  rLg: 24,
  rXl: 30,
  rPill: 999,
};

export const EMBER: ThemeTokens = {
  ...shared,
  id: 'ember',
  name: 'Ember',
  companion: 'Kindle',
  scheme: 'light',

  bg: '#FFF3EC',
  bgElevated: '#FFFBF8',
  surface: '#FFFFFF',
  surface2: '#FFF1E8',
  surfaceGlass: 'rgba(255,255,255,0.62)',
  glassBorder: 'rgba(255,255,255,0.85)',

  mesh: ['#FFE6D2', '#FF9C8A', '#FF6A3D', '#FFC15A'],

  border: 'rgba(43,18,36,0.10)',
  borderStrong: 'rgba(43,18,36,0.20)',

  text: '#2B1224',
  text2: '#6A4A5C',
  text3: '#9A8391',

  accent: '#E8501F',
  accentStrong: '#B8360F',
  onAccent: '#FFFFFF',

  heat1: '#FFB27A',
  heat2: '#FF7A3D',
  heat3: '#E8340F',

  highlight: '#FFE066',
  success: '#2E8B6B',
  danger: '#C7362B',
  focus: '#E8501F',

  navBar: 'rgba(43,18,36,0.92)',
  navBorder: 'rgba(255,255,255,0.10)',
  navActive: '#FFFFFF',
  navActiveText: '#2B1224',
  navInactive: 'rgba(255,255,255,0.62)',

  shadowColor: '#5B2A1A',
  shadowOpacity: 0.18,

  fontDisplay: 'Georgia',
  fontUI: 'System',
  fontRead: 'Georgia',

  spring: { damping: 26, stiffness: 260, mass: 1 },
  overshoot: 0.94,
};

export const MIDNIGHT: ThemeTokens = {
  ...shared,
  rLg: 26,
  rXl: 30,
  id: 'midnight',
  name: 'Midnight',
  companion: 'Dusk',
  scheme: 'dark',

  bg: '#0E0B10',
  bgElevated: '#15111A',
  surface: '#1B1621',
  surface2: '#251E2D',
  surfaceGlass: 'rgba(37,30,45,0.72)',
  glassBorder: 'rgba(255,235,220,0.10)',

  mesh: ['#2A1E12', '#4A2A10', '#FF5A2E', '#FFB020'],

  border: 'rgba(255,235,220,0.09)',
  borderStrong: 'rgba(255,235,220,0.18)',

  text: '#F6EFE6',
  text2: '#B3A9B8',
  text3: '#7A7080',

  accent: '#FFB020',
  accentStrong: '#FFB020',
  onAccent: '#1A1206',

  heat1: '#FF8A4C',
  heat2: '#FF5A2E',
  heat3: '#FFD98A',

  highlight: '#FFB020',
  success: '#4FD1A0',
  danger: '#FF6B5E',
  focus: '#FFB020',

  navBar: 'rgba(10,8,12,0.92)',
  navBorder: 'rgba(255,235,220,0.12)',
  navActive: '#FFB020',
  navActiveText: '#1A1206',
  navInactive: 'rgba(246,239,230,0.55)',

  shadowColor: '#000000',
  shadowOpacity: 0.5,

  fontDisplay: 'System',
  fontUI: 'System',
  fontRead: 'System',

  spring: { damping: 18, stiffness: 520, mass: 0.9 },
  overshoot: 0.9,
};

export const PAPER: ThemeTokens = {
  ...shared,
  rSm: 10,
  rMd: 14,
  rLg: 16,
  rXl: 20,
  id: 'paper',
  name: 'Paper',
  companion: 'Ink',
  scheme: 'light',

  bg: '#F5F6F3',
  bgElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surface2: '#ECEEEA',
  surfaceGlass: 'rgba(255,255,255,0.86)',
  glassBorder: '#DFE2DC',

  mesh: ['#ECEEEA', '#DFE2DC', '#C9CDC4', '#B7BCB2'],

  border: '#DFE2DC',
  borderStrong: '#C9CDC4',

  text: '#121212',
  text2: '#5B5E58',
  text3: '#8A8D86',

  accent: '#121212',
  accentStrong: '#121212',
  onAccent: '#FFFFFF',

  heat1: '#E8A08A',
  heat2: '#D8461B',
  heat3: '#B0300F',

  highlight: '#FFE066',
  success: '#2E7D5B',
  danger: '#C7362B',
  focus: '#121212',

  navBar: '#121212',
  navBorder: 'rgba(255,255,255,0.10)',
  navActive: '#FFFFFF',
  navActiveText: '#121212',
  navInactive: 'rgba(255,255,255,0.60)',

  shadowColor: '#2A2A28',
  shadowOpacity: 0.10,

  fontDisplay: 'Georgia',
  fontUI: 'System',
  fontRead: 'Georgia',

  spring: { damping: 30, stiffness: 300, mass: 1 },
  overshoot: 0.97,
};

export const THEMES: Record<ThemeId, ThemeTokens> = {
  ember: EMBER,
  midnight: MIDNIGHT,
  paper: PAPER,
};

export const THEME_ORDER: ThemeId[] = ['ember', 'midnight', 'paper'];

// Legacy stored id 'ink' maps to 'paper'.
export function normalizeTheme(id: string | null | undefined): ThemeId {
  if (id === 'ember' || id === 'midnight' || id === 'paper') return id;
  if (id === 'ink') return 'paper';
  return 'ember';
}
