import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing, cancelAnimation } from 'react-native-reanimated';
import { useThemeControls } from '../theme/ThemeProvider';

/**
 * A horizontal marquee row that loops its children by translating a duplicated
 * track. Reduced motion → static wrapped row.
 */
export function MarqueeRow({
  children,
  direction = 'left',
  speed = 40,
}: {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  speed?: number;
}) {
  const { reduceMotion } = useThemeControls();
  const [w, setW] = useState(0);
  const x = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || w === 0) return;
    const dur = (w / speed) * 1000;
    const from = direction === 'left' ? 0 : -w;
    const to = direction === 'left' ? -w : 0;
    x.value = from;
    x.value = withRepeat(withTiming(to, { duration: dur, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(x);
  }, [reduceMotion, w, speed, direction, x]);

  const aStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  if (reduceMotion) {
    return <View style={styles.static}>{children}</View>;
  }

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Animated.View style={[styles.track, aStyle]}>
        <View style={styles.group} onLayout={(e) => setW(e.nativeEvent.layout.width)}>{children}</View>
        <View style={styles.group}>{children}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  track: { flexDirection: 'row' },
  group: { flexDirection: 'row', gap: 10, paddingRight: 10 },
  static: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
});
