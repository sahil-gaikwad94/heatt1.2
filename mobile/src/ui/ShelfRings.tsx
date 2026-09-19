import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { ThemedText } from './Text';
import { blogCategories } from '../data/catalog';
import { useStore } from '../state/store';
import { Haptics } from '../motion/motion';

const shelfAbbrev: Record<string, string> = {
  'Creative practice': 'Create',
  'Books & ideas': 'Books',
  'Poetry & language': 'Poetry',
  Relationships: 'People',
  'Health & attention': 'Health',
  Leadership: 'Lead',
  'Strategy & decisions': 'Strategy',
  'Innovation & technology': 'Tech',
  'Work & careers': 'Work',
  'Culture & society': 'Culture',
  Philosophy: 'Philos.',
  'Making & craft': 'Craft',
  'Money & meaning': 'Money',
};

export function ShelfRings({ onSelect }: { onSelect: (category: string) => void }) {
  const t = useTheme();
  const { state } = useStore();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {blogCategories.map((cat, i) => {
        const explored = state.exploredShelves.includes(cat);
        return (
          <Pressable
            key={cat}
            onPress={() => { Haptics.tick(); onSelect(cat); }}
            style={styles.item}
            accessibilityRole="button"
            accessibilityLabel={`${cat} shelf${explored ? ', explored' : ''}`}
          >
            <View style={styles.ringOuter}>
              <LinearGradient
                colors={explored ? [t.heat1, t.heat3] : [t.border, t.border]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ring}
              >
                <View style={[styles.ringInner, { backgroundColor: t.surface }]}>
                  <ThemedText variant="mono" tone={explored ? 'accent' : 'muted'} style={{ fontSize: 11 }}>
                    {String(i + 1).padStart(2, '0')}
                  </ThemedText>
                </View>
              </LinearGradient>
            </View>
            <ThemedText variant="meta" tone="muted" numberOfLines={1} style={styles.caption}>
              {shelfAbbrev[cat] ?? cat}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 14, paddingVertical: 4 },
  item: { alignItems: 'center', width: 62 },
  ringOuter: { width: 60, height: 60 },
  ring: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', padding: 3 },
  ringInner: { flex: 1, width: '100%', borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  caption: { marginTop: 5, maxWidth: 60 },
});
