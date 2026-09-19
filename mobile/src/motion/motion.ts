import { Platform } from 'react-native';
import * as Haptics from './haptics';

export const springs = {
  snappy: { damping: 18, stiffness: 520, mass: 0.9 },
  soft: { damping: 26, stiffness: 260, mass: 1 },
  pop: { damping: 14, stiffness: 600, mass: 0.9 },
  gentle: { damping: 30, stiffness: 200, mass: 1 },
} as const;

export const durations = {
  fast: 160,
  base: 280,
  slow: 480,
  ambient: 6000,
} as const;

export { Haptics };
