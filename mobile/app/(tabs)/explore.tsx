import React, { useMemo, useState } from 'react';
import { View, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../src/ui/Screen';
import { ThemedText } from '../../src/ui/Text';
import { Icon } from '../../src/ui/Icon';
import { Card } from '../../src/ui/Surface';
import { Chip, Button } from '../../src/ui/Pressables';
import { GenerativeCover } from '../../src/ui/GenerativeCover';
import { FlareCard } from '../../src/ui/FlareCard';
import { ShareSheet } from '../../src/features/ShareSheet';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useStore } from '../../src/state/store';
import { useToast } from '../../src/ui/Toast';
import { blogCategories, blogCatalog } from '../../src/data/catalog';
import type { Flare } from '../../src/state/types';

export default function Explore() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams<{ category?: string }>();
  const { allFlares, allRooms, state, joinRoom, markShelfExplored } = useStore();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>(params.category ?? 'All');
  const [shareFlare, setShareFlare] = useState<Flare | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let f = allFlares;
    if (category !== 'All') f = f.filter((x) => x.topic === category);
    if (q) f = f.filter((x) => (x.text + (x.title ?? '') + (x.tags ?? []).join(' ')).toLowerCase().includes(q));
    return f;
  }, [allFlares, query, category]);

  const publicRooms = allRooms.filter((r) => r.privacy === 'public');

  return (
    <ScreenBackground>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <ThemedText variant="title">Explore</ThemedText>
        <Card style={styles.search} glass={t.id === 'ember'} padded={false}>
          <Icon name="search" size={18} color={t.text3} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search flares, topics, tags"
            placeholderTextColor={t.text3}
            style={[styles.searchInput, { color: t.text }]}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear">
              <Icon name="x" size={16} color={t.text3} />
            </Pressable>
          )}
        </Card>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {/* shelf filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All" active={category === 'All'} onPress={() => setCategory('All')} />
          {blogCategories.map((c) => (
            <Chip key={c} label={c} active={category === c} onPress={() => { setCategory(c); markShelfExplored(c); }} />
          ))}
        </ScrollView>

        {query.trim() === '' && category === 'All' && (
          <>
            {/* shelves as tiles */}
            <ThemedText variant="mono" tone="faint" style={styles.section}>SHELVES</ThemedText>
            <View style={styles.grid}>
              {blogCategories.map((c) => {
                const count = blogCatalog.filter((s) => s.category === c).length;
                const first = blogCatalog.find((s) => s.category === c);
                return (
                  <Pressable key={c} style={styles.tile} onPress={() => { setCategory(c); markShelfExplored(c); }}>
                    <GenerativeCover seed={c} accent={first?.accent ?? 'coral'} height={92} radius={t.rMd} />
                    <ThemedText variant="label" numberOfLines={1} style={{ marginTop: 8 }}>{c}</ThemedText>
                    <ThemedText variant="meta" tone="faint">{count} sources</ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {/* rooms directory */}
            <View style={styles.roomsHead}>
              <ThemedText variant="mono" tone="faint" style={styles.section}>KINDRED ROOMS</ThemedText>
              <Pressable onPress={() => router.push('/rooms')} hitSlop={8}>
                <ThemedText variant="meta" tone="accent">See all</ThemedText>
              </Pressable>
            </View>
            {publicRooms.slice(0, 4).map((r) => {
              const joined = state.joinedRooms.includes(r.id);
              return (
                <View key={r.id} style={{ paddingHorizontal: 16 }}>
                  <Card style={styles.roomCard}>
                    <View style={{ flex: 1 }}>
                      <ThemedText variant="label">{r.name}</ThemedText>
                      <ThemedText variant="meta" tone="muted" numberOfLines={2}>{r.description}</ThemedText>
                      <ThemedText variant="meta" tone="faint" style={{ marginTop: 4 }}>{r.topic}</ThemedText>
                    </View>
                    <Button label={joined ? 'Joined' : 'Join'} size="sm" variant={joined ? 'outline' : 'primary'} onPress={() => { joinRoom(r.id); toast.show({ message: `Joined ${r.name}` }); }} />
                  </Card>
                </View>
              );
            })}
          </>
        )}

        {(query.trim() !== '' || category !== 'All') && (
          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            <ThemedText variant="mono" tone="faint" style={{ marginBottom: 12 }}>
              {results.length} {results.length === 1 ? 'RESULT' : 'RESULTS'}
            </ThemedText>
            {results.map((f) => (
              <FlareCard key={f.id} flare={f} onOpenShare={setShareFlare} onFollowToast={(m) => toast.show({ message: m })} />
            ))}
            {results.length === 0 && (
              <ThemedText variant="body" tone="muted" style={{ textAlign: 'center', marginTop: 40 }}>
                Nothing matches yet. Try another word or shelf.
              </ThemedText>
            )}
          </View>
        )}
      </ScrollView>
      <ShareSheet flare={shareFlare} onClose={() => setShareFlare(null)} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, marginTop: 12 },
  searchInput: { flex: 1, fontSize: 15 },
  chips: { paddingHorizontal: 16, gap: 8, paddingVertical: 14 },
  section: { paddingHorizontal: 16, marginTop: 8, marginBottom: 12, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 0 },
  tile: { width: '50%', padding: 4, paddingHorizontal: 8, marginBottom: 8 },
  roomsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16, marginTop: 8 },
  roomCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
});
