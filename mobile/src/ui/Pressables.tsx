import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { useThemeControls } from '../theme/ThemeProvider';
import { ThemedText } from './Text';
import { springs, Haptics } from '../motion/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function useTapScale(target = 0.94) {
  const s = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const onIn = useCallback(() => {
    s.value = withSpring(target, springs.snappy);
  }, [s, target]);
  const onOut = useCallback(() => {
    s.value = withSpring(1, springs.pop);
  }, [s]);
  return { style, onIn, onOut };
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'glass';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  full?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label, onPress, variant = 'primary', icon, iconRight, disabled, full, size = 'md', style,
}: ButtonProps) {
  const t = useTheme();
  const { reduceMotion } = useThemeControls();
  const { style: aStyle, onIn, onOut } = useTapScale(t.overshoot);

  const pad = size === 'lg' ? { paddingVertical: 16, paddingHorizontal: 24 }
    : size === 'sm' ? { paddingVertical: 8, paddingHorizontal: 14 }
    : { paddingVertical: 13, paddingHorizontal: 20 };

  const bg = variant === 'primary' ? t.accentStrong
    : variant === 'glass' ? t.surfaceGlass
    : 'transparent';
  const borderColor = variant === 'outline' ? t.borderStrong
    : variant === 'glass' ? t.glassBorder
    : 'transparent';
  const textTone = variant === 'primary' ? 'onAccent' : 'default';

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : () => { Haptics.light(); onPress?.(); }}
      onPressIn={reduceMotion ? undefined : onIn}
      onPressOut={reduceMotion ? undefined : onOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[
        styles.btn,
        pad,
        { backgroundColor: bg, borderColor, borderWidth: variant === 'primary' ? 0 : 1.5, borderRadius: t.rPill, opacity: disabled ? 0.45 : 1 },
        full && { alignSelf: 'stretch' },
        reduceMotion ? undefined : aStyle,
        style,
      ]}
    >
      {icon}
      <ThemedText variant="label" tone={textTone as any}>{label}</ThemedText>
      {iconRight}
    </AnimatedPressable>
  );
}

type IconButtonProps = {
  onPress?: () => void;
  children: React.ReactNode;
  label: string; // accessibility
  size?: number;
  variant?: 'ghost' | 'surface' | 'glass' | 'accent';
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ onPress, children, label, size = 44, variant = 'ghost', style }: IconButtonProps) {
  const t = useTheme();
  const { reduceMotion } = useThemeControls();
  const { style: aStyle, onIn, onOut } = useTapScale(0.9);
  const bg = variant === 'surface' ? t.surface2
    : variant === 'glass' ? t.surfaceGlass
    : variant === 'accent' ? t.accentStrong
    : 'transparent';
  return (
    <AnimatedPressable
      onPress={() => { Haptics.light(); onPress?.(); }}
      onPressIn={reduceMotion ? undefined : onIn}
      onPressOut={reduceMotion ? undefined : onOut}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        {
          width: size, height: size, borderRadius: size / 2,
          alignItems: 'center', justifyContent: 'center', backgroundColor: bg,
          borderWidth: variant === 'glass' ? 1 : 0, borderColor: t.glassBorder,
        },
        reduceMotion ? undefined : aStyle,
        style,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  variant?: 'dashed' | 'solid' | 'ghost';
  style?: StyleProp<ViewStyle>;
};

export function Chip({ label, active, onPress, icon, variant = 'ghost', style }: ChipProps) {
  const t = useTheme();
  const { reduceMotion } = useThemeControls();
  const { style: aStyle, onIn, onOut } = useTapScale(0.9);

  const dashed = variant === 'dashed';
  const bg = active
    ? (t.id === 'midnight' ? t.text : t.accentStrong)
    : (dashed ? 'transparent' : t.surface2);
  const bd = active
    ? bg
    : (dashed ? t.borderStrong : 'transparent');
  const textTone = active ? (t.id === 'midnight' ? 'default' : 'onAccent') : 'default';

  return (
    <AnimatedPressable
      onPress={() => { Haptics.tick(); onPress?.(); }}
      onPressIn={reduceMotion ? undefined : onIn}
      onPressOut={reduceMotion ? undefined : onOut}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[
        styles.chip,
        {
          backgroundColor: active && t.id === 'midnight' ? t.text : bg,
          borderColor: bd,
          borderWidth: dashed ? 1.5 : active ? 0 : 1,
          borderStyle: dashed && !active ? 'dashed' : 'solid',
          borderRadius: t.rPill,
        },
        reduceMotion ? undefined : aStyle,
        style,
      ]}
    >
      {icon}
      <ThemedText
        variant="meta"
        style={{ fontWeight: '600' }}
        tone={active ? (t.id === 'midnight' ? 'default' : 'onAccent') : 'default'}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14 },
});
