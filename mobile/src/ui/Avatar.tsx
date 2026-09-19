import React from 'react';
import { View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from './Text';
import { accentTint } from './palette';

export function Avatar({
  initials,
  accent = 'coral',
  size = 44,
  avatarData,
}: {
  initials: string;
  accent?: string;
  size?: number;
  avatarData?: string;
}) {
  const [a, b] = accentTint(accent);
  if (avatarData) {
    return (
      <Image
        source={{ uri: avatarData }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        accessibilityIgnoresInvertColors
      />
    );
  }
  return (
    <LinearGradient
      colors={[a, b]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
    >
      <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.36 }}>{initials}</ThemedText>
    </LinearGradient>
  );
}
