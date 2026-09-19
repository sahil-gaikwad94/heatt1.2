import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS, interpolate, Extrapolation } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';
import { ThemedText } from './Text';
import { IconButton } from './Pressables';
import { Icon } from './Icon';
import { springs } from '../motion/motion';

const { height: SCREEN_H } = Dimensions.get('window');

export function Sheet({
  visible,
  onClose,
  title,
  children,
  fullHeight = false,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullHeight?: boolean;
}) {
  const t = useTheme();
  const { reduceMotion } = useThemeControls();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_H);
  const [mounted, setMounted] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = reduceMotion ? 0 : withSpring(0, { damping: 24, stiffness: 300 });
    } else if (mounted) {
      translateY.value = reduceMotion ? SCREEN_H : withTiming(SCREEN_H, { duration: 240 }, (f) => { if (f) runOnJS(setMounted)(false); });
      if (reduceMotion) setMounted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, reduceMotion]);

  const pan = Gesture.Pan()
    .onUpdate((e) => { translateY.value = Math.max(0, e.translationY); })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 700) {
        translateY.value = withTiming(SCREEN_H, { duration: 220 }, (f) => { if (f) runOnJS(onClose)(); });
      } else {
        translateY.value = withSpring(0, springs.snappy);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, SCREEN_H], [1, 0], Extrapolation.CLAMP),
  }));

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close sheet" />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: t.bgElevated,
            borderColor: t.border,
            maxHeight: fullHeight ? SCREEN_H - insets.top - 8 : SCREEN_H * 0.86,
            paddingBottom: insets.bottom + 8,
          },
          sheetStyle,
        ]}
      >
        <GestureDetector gesture={pan}>
          <View style={styles.grabZone}>
            <View style={[styles.grabber, { backgroundColor: t.border }]} />
            {title && (
              <View style={styles.header}>
                <ThemedText variant="heading">{title}</ThemedText>
                <IconButton label="Close" onPress={onClose} size={36} variant="surface">
                  <Icon name="x" size={18} color={t.text} />
                </IconButton>
              </View>
            )}
          </View>
        </GestureDetector>
        <View style={{ flex: fullHeight ? 1 : 0 }}>{children}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
  },
  grabZone: { paddingTop: 10 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
});
