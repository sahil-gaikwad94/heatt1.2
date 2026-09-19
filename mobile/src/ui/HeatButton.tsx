import React, { useCallback, useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring, withTiming, withRepeat,
  runOnJS, cancelAnimation, Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';
import { Icon } from './Icon';
import { ThemedText } from './Text';
import { springs, Haptics } from '../motion/motion';

/**
 * Heat: one reaction per reader, intensity 1..3.
 *  - tap toggles heat 1 (off if already 1)
 *  - press-and-hold charges 1 → 3 over ~900ms, release commits the reached level
 * Accessible fallback: long-press opens nothing scary; the row also exposes an
 * intensity stepper via onRequestMenu.
 */
export function HeatButton({
  level,
  onSet,
  onRequestMenu,
  size = 22,
  showLabel = true,
}: {
  level: number; // current committed level 0..3
  onSet: (n: number) => void;
  onRequestMenu?: () => void;
  size?: number;
  showLabel?: boolean;
}) {
  const t = useTheme();
  const { reduceMotion } = useThemeControls();
  const charge = useSharedValue(0); // 0..1 during hold
  const scale = useSharedValue(1);
  const glow = useSharedValue(level > 0 ? 1 : 0);

  useEffect(() => {
    glow.value = reduceMotion ? (level > 0 ? 1 : 0) : withSpring(level > 0 ? 1 : 0, springs.pop);
  }, [level, reduceMotion, glow]);

  const commit = useCallback((n: number) => {
    Haptics.medium();
    onSet(n);
  }, [onSet]);

  const chargedLevel = () => Math.min(3, 1 + Math.floor(charge.value * 3));

  const tap = Gesture.Tap()
    .maxDuration(280)
    .onEnd(() => {
      'worklet';
      if (!reduceMotion) {
        scale.value = withSpring(1.25, springs.pop, () => {
          scale.value = withSpring(1, springs.soft);
        });
      }
      runOnJS(commit)(level === 1 ? 0 : 1);
    });

  const hold = Gesture.LongPress()
    .minDuration(220)
    .maxDistance(60)
    .onStart(() => {
      'worklet';
      if (reduceMotion) return;
      charge.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) });
      scale.value = withRepeat(withTiming(1.18, { duration: 300 }), -1, true);
    })
    .onEnd(() => {
      'worklet';
      cancelAnimation(scale);
      scale.value = withSpring(1, springs.pop);
      const reached = reduceMotion ? Math.max(1, level) : chargedLevel();
      charge.value = withTiming(0, { duration: 200 });
      runOnJS(commit)(reached);
    });

  const composed = Gesture.Exclusive(hold, tap);

  const iconColorStyle = useAnimatedStyle(() => {
    const active = level > 0 || charge.value > 0;
    return {
      transform: [{ scale: scale.value }],
      opacity: active ? 1 : 0.9,
    };
  });

  const iconColor = level >= 3 ? t.heat3 : level === 2 ? t.heat2 : level === 1 ? t.heat1 : t.text3;

  return (
    <View style={styles.row}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.hit, iconColorStyle]} accessibilityRole="button" accessibilityLabel={`Heat, level ${level} of 3. Tap to add, hold to intensify.`}>
          <Icon name="fire" size={size} color={iconColor} />
        </Animated.View>
      </GestureDetector>
      {showLabel && level > 0 && (
        <ThemedText variant="meta" style={{ color: iconColor, fontWeight: '700' }}>{level}</ThemedText>
      )}
      {onRequestMenu && (
        <Pressable
          onPress={onRequestMenu}
          hitSlop={8}
          accessibilityLabel="Choose heat intensity"
          accessibilityRole="button"
          style={{ paddingHorizontal: 2 }}
        >
          <Icon name="chevron-down" size={12} color={t.text3} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  hit: { minWidth: 30, minHeight: 30, alignItems: 'center', justifyContent: 'center' },
});
