import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '../ui/Text';
import { Icon } from '../ui/Icon';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';
import { THEMES, THEME_ORDER, type ThemeId } from '../theme/themes';
import { Haptics } from '../motion/motion';

export function ThemePicker() {
  const t = useTheme();
  const { themeId, setTheme } = useThemeControls();

  return (
    <View style={styles.wrap}>
      {THEME_ORDER.map((id) => {
        const th = THEMES[id];
        const active = id === themeId;
        return (
          <Pressable
            key={id}
            onPress={() => { Haptics.medium(); setTheme(id); }}
            style={[styles.card, { borderColor: active ? t.accent : t.border, borderWidth: active ? 2 : 1, backgroundColor: t.surface }]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${th.name} theme${active ? ', selected' : ''}`}
          >
            <View style={styles.swatch}>
              <LinearGradient colors={id === 'ember' ? [th.mesh[1], th.mesh[2]] : id === 'midnight' ? [th.bg, th.surface2] : [th.surface, th.surface2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <View style={[styles.dot, { backgroundColor: th.accent }]} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText variant="label">{th.name}</ThemedText>
              <ThemedText variant="meta" tone="faint">{th.companion}</ThemedText>
            </View>
            {active && <Icon name="check" size={18} color={t.accent} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 16 },
  swatch: { width: 52, height: 52, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)' },
});
