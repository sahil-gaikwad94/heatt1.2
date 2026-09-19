import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';
import { ThemedText } from './Text';
import { Icon } from './Icon';
import { springs } from '../motion/motion';

type ToastOpts = { message: string; actionLabel?: string; onAction?: () => void };
type ToastCtx = { show: (opts: ToastOpts) => void };

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOpts | null>(null);
  const insets = useSafeAreaInsets();
  const t = useTheme();
  const { reduceMotion } = useThemeControls();
  const ty = useSharedValue(120);
  const tx = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (reduceMotion) { setToast(null); return; }
    ty.value = withTiming(120, { duration: 220 }, () => runOnJS(setToast)(null));
  }, [reduceMotion, ty]);

  const show = useCallback((opts: ToastOpts) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(opts);
    tx.value = 0;
    ty.value = reduceMotion ? 0 : withSpring(0, springs.snappy);
    timer.current = setTimeout(hide, 3400);
  }, [hide, reduceMotion, tx, ty]);

  const pan = Gesture.Pan()
    .onUpdate((e) => { tx.value = e.translationX; })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 100 || Math.abs(e.velocityX) > 500) {
        tx.value = withTiming(e.translationX > 0 ? 400 : -400, { duration: 180 }, () => runOnJS(setToast)(null));
      } else {
        tx.value = withSpring(0, springs.soft);
      }
    });

  const aStyle = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }, { translateX: tx.value }], opacity: 1 - Math.min(1, Math.abs(tx.value) / 300) }));

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {toast && (
        <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 96 }]}>
          <GestureDetector gesture={pan}>
            <Animated.View style={[styles.toast, { backgroundColor: t.id === 'paper' ? '#121212' : t.bgElevated, borderColor: t.border }, aStyle]}>
              <ThemedText variant="label" style={{ flex: 1, color: t.id === 'paper' ? '#fff' : t.text }}>{toast.message}</ThemedText>
              {toast.actionLabel && (
                <Pressable
                  onPress={() => { toast.onAction?.(); hide(); }}
                  hitSlop={8}
                  accessibilityRole="button"
                >
                  <ThemedText variant="label" tone="accent">{toast.actionLabel}</ThemedText>
                </Pressable>
              )}
              <Pressable onPress={hide} hitSlop={8} accessibilityLabel="Dismiss">
                <Icon name="x" size={16} color={t.id === 'paper' ? '#fff' : t.text3} />
              </Pressable>
            </Animated.View>
          </GestureDetector>
        </View>
      )}
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) return { show: () => {} };
  return ctx;
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, width: '100%', maxWidth: 440, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
});
