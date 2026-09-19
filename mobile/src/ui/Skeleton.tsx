import React, { useEffect } from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing, cancelAnimation } from 'react-native-reanimated';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';

export function Skeleton({ width, height, radius = 8, style }: { width?: number | string; height?: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const { reduceMotion } = useThemeControls();
  const o = useSharedValue(0.5);
  useEffect(() => {
    if (reduceMotion) { o.value = 0.6; return; }
    o.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(o);
  }, [reduceMotion, o]);
  const aStyle = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View
      style={[
        { width: (width as any) ?? '100%', height: height ?? 14, borderRadius: radius, backgroundColor: t.surface2 },
        aStyle,
        style,
      ]}
    />
  );
}
