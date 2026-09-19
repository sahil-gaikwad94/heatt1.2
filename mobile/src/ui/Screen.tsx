import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { MeshBackdrop } from './MeshBackdrop';

/**
 * The base canvas for every screen. Ember gets a living gradient mesh; Midnight
 * a deep aubergine field with a faint top glow; Paper a flat editorial canvas.
 */
export function ScreenBackground({ children }: { children: React.ReactNode }) {
  const t = useTheme();

  if (t.id === 'ember') {
    return (
      <View style={styles.fill}>
        <MeshBackdrop />
        {children}
      </View>
    );
  }

  if (t.id === 'midnight') {
    return (
      <View style={[styles.fill, { backgroundColor: t.bg }]}>
        <LinearGradient
          colors={['rgba(255,90,46,0.10)', 'rgba(14,11,16,0)']}
          style={styles.topGlow}
          pointerEvents="none"
        />
        {children}
      </View>
    );
  }

  return <View style={[styles.fill, { backgroundColor: t.bg }]}>{children}</View>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 280 },
});
