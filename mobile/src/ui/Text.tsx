import React from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'read' | 'label' | 'meta' | 'mono';
type Tone = 'default' | 'muted' | 'faint' | 'accent' | 'onAccent' | 'danger';

const sizeMap: Record<Variant, TextStyle> = {
  display: { fontSize: 34, lineHeight: 38, fontWeight: '800', letterSpacing: -0.5 },
  title: { fontSize: 26, lineHeight: 31, fontWeight: '800', letterSpacing: -0.3 },
  heading: { fontSize: 19, lineHeight: 24, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 15.5, lineHeight: 22, fontWeight: '400' },
  read: { fontSize: 17.5, lineHeight: 28, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
  meta: { fontSize: 12.5, lineHeight: 16, fontWeight: '500' },
  mono: { fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.4 },
};

export function ThemedText({
  variant = 'body',
  tone = 'default',
  serif = false,
  style,
  children,
  ...rest
}: TextProps & { variant?: Variant; tone?: Tone; serif?: boolean }) {
  const t = useTheme();
  const toneColor =
    tone === 'muted' ? t.text2
    : tone === 'faint' ? t.text3
    : tone === 'accent' ? t.accent
    : tone === 'onAccent' ? t.onAccent
    : tone === 'danger' ? t.danger
    : t.text;

  const useSerif = serif || variant === 'read' || variant === 'display' || variant === 'title';
  const fontFamily = variant === 'mono' ? undefined
    : useSerif ? t.fontDisplay
    : t.fontUI;

  return (
    <RNText
      style={[sizeMap[variant], { color: toneColor, fontFamily }, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
