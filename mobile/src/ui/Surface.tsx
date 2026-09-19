import React from 'react';
import { View, StyleSheet, Platform, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function elevation(color: string, opacity: number, level: 1 | 2 | 3) {
  const y = level * 4;
  const radius = level * 8;
  if (Platform.OS === 'android') {
    return { elevation: level * 3 } as ViewStyle;
  }
  if (Platform.OS === 'web') {
    return {
      // @ts-ignore web
      boxShadow: `0 ${y}px ${radius}px rgba(0,0,0,${opacity * 0.6})`,
    } as ViewStyle;
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: y },
    shadowOpacity: opacity,
    shadowRadius: radius,
  } as ViewStyle;
}

export function Card({
  children,
  style,
  glass = false,
  level = 1,
  padded = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glass?: boolean;
  level?: 1 | 2 | 3;
  padded?: boolean;
}) {
  const t = useTheme();
  const bg = glass ? t.surfaceGlass : t.surface;
  const borderColor = glass ? t.glassBorder : t.border;
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: t.rLg,
          borderWidth: t.id === 'paper' ? 1 : glass ? 1 : StyleSheet.hairlineWidth,
          borderColor,
        },
        padded && { padding: 16 },
        t.id !== 'paper' && elevation(t.shadowColor, t.shadowOpacity, level),
        style,
      ]}
    >
      {children}
    </View>
  );
}
