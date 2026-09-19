import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSpring, Easing, cancelAnimation } from 'react-native-reanimated';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';
import { blogCategories } from '../data/catalog';
import { useStore } from '../state/store';
import { Icon } from '../ui/Icon';
import { Haptics } from '../motion/motion';

/**
 * The Heat Orb — Ember's signature. A glass sphere whose ring holds one waypoint
 * dot per shelf (13). Dots light the first time a shelf is explored and never
 * dim. No number, no percentage — waypoints only. Tap = boop; hold = breathe.
 */
export function HeatOrb({ size = 200 }: { size?: number }) {
  const t = useTheme();
  const { reduceMotion } = useThemeControls();
  const { state } = useStore();
  const breathe = useSharedValue(0);
  const boop = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) { breathe.value = 0; return; }
    breathe.value = withRepeat(withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(breathe);
  }, [reduceMotion, breathe]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: (1 + breathe.value * 0.03) * boop.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.5 + breathe.value * 0.35 }));

  const onBoop = () => {
    Haptics.medium();
    if (reduceMotion) return;
    boop.value = withSpring(0.9, { damping: 6, stiffness: 400 }, () => {
      boop.value = withSpring(1, { damping: 8, stiffness: 300 });
    });
  };

  const r = size / 2;
  const dotR = r - 10;
  const explored = new Set(state.exploredShelves);

  return (
    <Pressable onPress={onBoop} accessibilityRole="button" accessibilityLabel={`Heat orb. ${explored.size} of ${blogCategories.length} shelves explored.`}>
      <Animated.View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, orbStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, glowStyle]}>
          <Svg width={size} height={size}>
            <Defs>
              <RadialGradient id="orbGlow" cx="0.5" cy="0.42" r="0.6">
                <Stop offset="0" stopColor={t.mesh[2]} stopOpacity="0.5" />
                <Stop offset="1" stopColor={t.mesh[2]} stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="orbBody" cx="0.4" cy="0.35" r="0.75">
                <Stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
                <Stop offset="0.55" stopColor={t.mesh[1]} stopOpacity="0.6" />
                <Stop offset="1" stopColor={t.mesh[2]} stopOpacity="0.5" />
              </RadialGradient>
            </Defs>
            <Circle cx={r} cy={r} r={r} fill="url(#orbGlow)" />
            <Circle cx={r} cy={r} r={r - 16} fill="url(#orbBody)" />
            {/* waypoint ring */}
            {blogCategories.map((cat, i) => {
              const angle = (i / blogCategories.length) * Math.PI * 2 - Math.PI / 2;
              const cx = r + Math.cos(angle) * dotR;
              const cy = r + Math.sin(angle) * dotR;
              const on = explored.has(cat);
              return (
                <Circle
                  key={cat}
                  cx={cx}
                  cy={cy}
                  r={on ? 4.5 : 3}
                  fill={on ? t.heat3 : 'rgba(43,18,36,0.18)'}
                />
              );
            })}
          </Svg>
        </Animated.View>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="fire" size={size * 0.28} color={t.accentStrong} />
        </View>
      </Animated.View>
    </Pressable>
  );
}
