import { Platform, Vibration } from 'react-native';

/**
 * Minimal, dependency-free haptics. On Android we use the built-in Vibration
 * API with tiny pulses. On iOS/web these are no-ops (a real build would swap in
 * expo-haptics). Always feature-gated and user-toggleable via preferences.
 */
let enabled = true;

export function setEnabled(v: boolean) {
  enabled = v;
}

function pulse(ms: number) {
  if (!enabled) return;
  if (Platform.OS === 'android') {
    try {
      Vibration.vibrate(ms);
    } catch {
      // ignore
    }
  }
}

export function light() {
  pulse(8);
}
export function medium() {
  pulse(12);
}
export function tick() {
  pulse(6);
}
export function success() {
  pulse(16);
}
