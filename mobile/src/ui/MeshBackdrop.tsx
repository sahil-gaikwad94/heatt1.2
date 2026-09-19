import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing, cancelAnimation } from 'react-native-reanimated';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';

const { width } = Dimensions.get('window');

function Blob({
  color, size, x, y, delay, drift, reduce,
}: {
  color: string; size: number; x: number; y: number; delay: number; drift: number; reduce: boolean;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    if (reduce) { p.value = 0.5; return; }
    p.value = withRepeat(withTiming(1, { duration: 22000 + delay, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(p);
  }, [reduce, delay, p]);
  const aStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: (p.value - 0.5) * drift },
      { translateY: (p.value - 0.5) * drift * 0.7 },
      { scale: 1 + (p.value - 0.5) * 0.18 },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: x, top: y, width: size, height: size }, aStyle]}
    >
      <LinearGradient
        colors={[color, 'transparent']}
        style={{ width: size, height: size, borderRadius: size / 2, opacity: 0.85 }}
        start={{ x: 0.3, y: 0.2 }}
        end={{ x: 0.8, y: 0.9 }}
      />
    </Animated.View>
  );
}

export function MeshBackdrop() {
  const t = useTheme();
  const { reduceMotion } = useThemeControls();
  const [c0, c1, c2, c3] = t.mesh;
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: c0 }]} pointerEvents="none">
      <Blob color={c1} size={width * 0.9} x={-width * 0.2} y={-60} delay={0} drift={70} reduce={reduceMotion} />
      <Blob color={c2} size={width * 0.8} x={width * 0.4} y={80} delay={4000} drift={90} reduce={reduceMotion} />
      <Blob color={c3} size={width * 0.7} x={-width * 0.1} y={360} delay={8000} drift={60} reduce={reduceMotion} />
      <Blob color={c2} size={width * 0.75} x={width * 0.45} y={520} delay={2000} drift={80} reduce={reduceMotion} />
      {/* soft light wash so text stays legible over the mesh */}
      <LinearGradient
        colors={['rgba(255,251,248,0.35)', 'rgba(255,243,236,0.7)']}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
