import React, { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';
import { ThemedText } from './Text';
import { springs, Haptics } from '../motion/motion';

export function Segmented({
  options,
  value,
  onChange,
  compact = false,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  const t = useTheme();
  const { reduceMotion } = useThemeControls();
  const [w, setW] = useState(0);
  const activeIndex = Math.max(0, options.indexOf(value));
  const x = useSharedValue(activeIndex);

  useEffect(() => {
    x.value = reduceMotion ? activeIndex : withSpring(activeIndex, springs.snappy);
  }, [activeIndex, reduceMotion, x]);

  const seg = w / options.length;
  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * seg }] }));

  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  return (
    <View
      style={[styles.wrap, { backgroundColor: t.surface2, borderRadius: t.rPill, padding: 3 }]}
      onLayout={onLayout}
    >
      {w > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            { width: seg - 6, backgroundColor: t.surface, borderRadius: t.rPill },
            t.id !== 'paper' && { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
            indicator,
          ]}
        />
      )}
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => { Haptics.tick(); onChange(opt); }}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <ThemedText variant={compact ? 'meta' : 'label'} tone={active ? 'default' : 'faint'} style={{ fontWeight: active ? '700' : '600' }}>
              {opt}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', position: 'relative', alignSelf: 'stretch' },
  indicator: { position: 'absolute', top: 3, bottom: 3, left: 3 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, zIndex: 2 },
});
