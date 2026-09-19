import React, { useMemo, useState, useCallback } from 'react';
import { View, FlatList, Pressable, StyleSheet, RefreshControl } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../src/ui/Screen';
import { AppHeader } from '../../src/ui/AppHeader';
import { ShelfRings } from '../../src/ui/ShelfRings';
import { Segmented } from '../../src/ui/Segmented';
import { FlareCard } from '../../src/ui/FlareCard';
import { ThemedText } from '../../src/ui/Text';
import { Avatar } from '../../src/ui/Avatar';
import { Icon } from '../../src/ui/Icon';
import { Card } from '../../src/ui/Surface';
import { HeatOrb } from '../../src/features/HeatOrb';
import { ShareSheet } from '../../src/features/ShareSheet';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useStore } from '../../src/state/store';
import { useToast } from '../../src/ui/Toast';
import type { Flare } from '../../src/state/types';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Flare>);
const FEED_MODES = ['For you', 'Following', 'Rooms'];

export default function Home() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { allFlares, state, markShelfExplored } = useStore();
  const [mode, setMode] = useState('For you');
  const [refreshing, setRefreshing] = useState(false);
  const [shareFlare, setShareFlare] = useState<Flare | null>(null);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((e) => { scrollY.value = e.contentOffset.y; });

  const feed = useMemo(() => {
    if (mode === 'Following') {
      const set = new Set(state.following);
      const f = allFlares.filter((x) => set.has(x.authorId));
      return f;
    }
    if (mode === 'Rooms') {
      return allFlares.filter((x) => x.room);
    }
    // For you — prioritise preferred topics
    const prefs = new Set(state.preferences.topics);
    return [...allFlares].sort((a, b) => {
      const ap = prefs.has(a.topic) ? 1 : 0;
      const bp = prefs.has(b.topic) ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return b.createdAt - a.createdAt;
    });
  }, [allFlares, mode, state.following, state.preferences.topics]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const openShelf = (cat: string) => {
    markShelfExplored(cat);
    router.push({ pathname: '/explore', params: { category: cat } });
  };

  const ListHeader = (
    <View>
      <View style={{ marginTop: 8 }}>
        <ShelfRings onSelect={openShelf} />
      </View>

      {/* composer bar */}
      <Pressable onPress={() => router.push('/create')} style={styles.composerWrap} accessibilityRole="button" accessibilityLabel="Write a flare">
        <Card style={styles.composer} glass={t.id === 'ember'} level={1}>
          <Avatar initials={state.profile.name.slice(0, 1).toUpperCase()} accent="user" size={36} avatarData={state.profile.avatarData} />
          <ThemedText variant="body" tone="faint" style={{ flex: 1 }}>What's on your mind?</ThemedText>
          <View style={[styles.composerIcon, { backgroundColor: t.accentStrong }]}>
            <Icon name="edit" size={16} color={t.onAccent} />
          </View>
        </Card>
      </Pressable>

      {/* feed mode tabs */}
      <View style={styles.tabsWrap}>
        <Segmented options={FEED_MODES} value={mode} onChange={setMode} />
      </View>
    </View>
  );

  return (
    <ScreenBackground>
      <AppHeader scrollY={scrollY} />
      <AnimatedFlatList
        data={feed}
        keyExtractor={(item) => item.id}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <FlareCard flare={item} onOpenShare={setShareFlare} onFollowToast={(m) => toast.show({ message: m })} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <HeatOrb size={120} />
            <ThemedText variant="heading" style={{ marginTop: 16, textAlign: 'center' }}>
              {mode === 'Following' ? 'Follow a few voices' : 'Nothing here yet'}
            </ThemedText>
            <ThemedText variant="body" tone="muted" style={{ textAlign: 'center', marginTop: 6 }}>
              {mode === 'Following'
                ? 'When you follow writers and publishers, their flares gather here.'
                : 'Pull to refresh, or start a flare of your own.'}
            </ThemedText>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} colors={[t.accent]} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
      />
      <ShareSheet flare={shareFlare} onClose={() => setShareFlare(null)} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  composerWrap: { paddingHorizontal: 16, marginTop: 14 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  composerIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabsWrap: { paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  empty: { alignItems: 'center', paddingHorizontal: 40, paddingTop: 60 },
});
