import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, normalizeTheme, type ThemeId, type ThemeTokens } from './themes';

type MotionPref = 'system' | 'reduced' | 'full';

type ThemeContextValue = {
  theme: ThemeTokens;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  ready: boolean;
  motionPref: MotionPref;
  setMotionPref: (p: MotionPref) => void;
  reduceMotion: boolean; // resolved
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = 'heatt-theme';
const MOTION_KEY = 'heatt-motion';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeId, setThemeId] = useState<ThemeId>('ember');
  const [motionPref, setMotionPrefState] = useState<MotionPref>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [storedTheme, storedMotion] = await Promise.all([
          AsyncStorage.getItem(THEME_KEY),
          AsyncStorage.getItem(MOTION_KEY),
        ]);
        if (!mounted) return;
        if (storedTheme) {
          setThemeId(normalizeTheme(storedTheme));
        } else {
          // First run: light OS → Ember, dark OS → Midnight.
          setThemeId(systemScheme === 'dark' ? 'midnight' : 'ember');
        }
        if (storedMotion === 'reduced' || storedMotion === 'full' || storedMotion === 'system') {
          setMotionPrefState(storedMotion);
        }
      } catch {
        // fall through to defaults
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
    AsyncStorage.setItem(THEME_KEY, id).catch(() => {});
  }, []);

  const setMotionPref = useCallback((p: MotionPref) => {
    setMotionPrefState(p);
    AsyncStorage.setItem(MOTION_KEY, p).catch(() => {});
  }, []);

  const reduceMotion = motionPref === 'reduced';

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: THEMES[themeId],
      themeId,
      setTheme,
      ready,
      motionPref,
      setMotionPref,
      reduceMotion,
    }),
    [themeId, setTheme, ready, motionPref, setMotionPref, reduceMotion],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeTokens {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx.theme;
}

export function useThemeControls() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeControls must be used within ThemeProvider');
  return ctx;
}
