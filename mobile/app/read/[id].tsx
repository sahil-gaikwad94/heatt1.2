import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, interpolate, Extrapolation } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../src/ui/Screen';
import { BackHeader } from '../../src/ui/BackHeader';
import { ThemedText } from '../../src/ui/Text';
import { Icon } from '../../src/ui/Icon';
import { Button, IconButton } from '../../src/ui/Pressables';
import { GenerativeCover } from '../../src/ui/GenerativeCover';
import { Avatar } from '../../src/ui/Avatar';
import { Markdown } from '../../src/ui/Markdown';
import { HeatButton } from '../../src/ui/HeatButton';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useStore } from '../../src/state/store';
import { useToast } from '../../src/ui/Toast';
import { articleById, articlesForSource } from '../../src/data/articles';
import { sourceById } from '../../src/data/catalog';
import { timeAgo } from '../../src/lib/format';
import type { Flare } from '../../src/state/types';

const SIZE_MAP = { S: 16, M: 18.5, L: 21 };

export default function Reader() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { state, updatePreferences, addJournal, toggleSave, setHeat, allFlares } = useStore();
  const scrollY = useSharedValue(0);
  const maxScroll = useSharedValue(1);

  const article = articleById(id ?? '');
  const source = article ? sourceById(article.sourceId) : undefined;
  const flareId = `seed-${id}`;
  const saved = state.saved.includes(flareId);
  const heat = state.reactions[flareId] ?? 0;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
      maxScroll.value = Math.max(1, e.contentSize.height - e.layoutMeasurement.height);
    },
  });

  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(scrollY.value, [0, maxScroll.value], [0, 100], Extrapolation.CLAMP)}%`,
  }));

  const fontSize = SIZE_MAP[state.preferences.textSize];
  const serif = state.preferences.readingFont === 'serif';

  if (!article) {
    return (
      <ScreenBackground>
        <BackHeader title="Reader" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <ThemedText tone="muted" style={{ textAlign: 'center' }}>This reading isn\u2019t available.</ThemedText>
        </View>
      </ScreenBackground>
    );
  }

  const accent = source?.accent ?? 'coral';
  const more = articlesForSource(article.sourceId).filter((a) => a.id !== article.id).slice(0, 3);

  const sizeControl = (['S', 'M', 'L'] as const).map((s) => (
    <Pressable key={s} onPress={() => updatePreferences({ textSize: s })} style={[styles.sizeBtn, state.preferences.textSize === s && { backgroundColor: t.text }]} accessibilityLabel={`Text size ${s}`}>
      <ThemedText style={{ fontWeight: '800', fontSize: s === 'S' ? 11 : s === 'M' ? 13 : 16, color: state.preferences.textSize === s ? t.bg : t.text2 }}>Abc</ThemedText>
    </Pressable>
  ));

  return (
    <ScreenBackground>
      {/* flame progress line */}
      <View style={{ height: 3, backgroundColor: t.border, marginTop: insets.top }}>
        <Animated.View style={[{ height: 3, backgroundColor: t.heat2 }, progressStyle]} />
      </View>
      <BackHeader
        right={
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <IconButton label="Save" size={40} variant={t.id === 'ember' ? 'glass' : 'surface'} onPress={() => { toggleSave(flareId); toast.show({ message: saved ? 'Removed from saved' : 'Saved to read later' }); }}>
              <Icon name={saved ? 'bookmark-fill' : 'bookmark'} size={17} color={saved ? t.accent : t.text} />
            </IconButton>
          </View>
        }
      />

      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 60 }} showsVerticalScrollIndicator={false}>
        <ThemedText variant="mono" tone="faint" style={{ letterSpacing: 1 }}>{article.category.toUpperCase()}</ThemedText>
        <ThemedText variant="display" serif style={{ marginTop: 8 }}>{article.title}</ThemedText>

        {/* byline */}
        <View style={styles.byline}>
          <Avatar initials={source?.initials ?? article.author.slice(0, 2).toUpperCase()} accent={accent} size={40} />
          <View style={{ marginLeft: 10 }}>
            <ThemedText variant="label">{article.author}</ThemedText>
            <ThemedText variant="meta" tone="faint">
              {article.readingMinutes} min read{article.publishedAt ? ` \u00b7 ${timeAgo(article.publishedAt)}` : ''}
            </ThemedText>
          </View>
        </View>

        {/* cover */}
        <View style={{ marginTop: 16 }}>
          <GenerativeCover seed={article.id} accent={accent} initials={source?.initials} height={180} radius={t.rMd} />
        </View>

        {/* text controls */}
        <View style={[styles.controls, { borderColor: t.border }]}>
          <View style={styles.sizeGroup}>{sizeControl}</View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(['serif', 'sans'] as const).map((f) => (
              <Pressable key={f} onPress={() => updatePreferences({ readingFont: f })} style={[styles.fontBtn, { borderColor: t.border }, state.preferences.readingFont === f && { backgroundColor: t.surface2 }]}>
                <ThemedText variant="meta" tone={state.preferences.readingFont === f ? 'default' : 'faint'} style={{ fontWeight: '600' }}>
                  {f === 'serif' ? 'Serif' : 'Sans'}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* the full article — rendered in-app */}
        <View style={{ marginTop: 22 }}>
          <Markdown source={article.body} fontSize={fontSize} serif={serif} />
        </View>

        {/* keep-a-line */}
        <View style={styles.keepRow}>
          <Button label="Keep a line" variant="outline" icon={<Icon name="quote" size={15} color={t.text} />} onPress={() => { addJournal({ source: article.author, quote: article.excerpt, note: '' }); toast.show({ message: 'Kept in your journal.' }); }} />
        </View>

        {/* inline actions */}
        <View style={[styles.actions, { borderColor: t.border }]}>
          <HeatButton level={heat} onSet={(n) => setHeat(flareId, n)} />
          <IconButton label="Save" size={40} onPress={() => toggleSave(flareId)}>
            <Icon name={saved ? 'bookmark-fill' : 'bookmark'} size={18} color={saved ? t.accent : t.text2} />
          </IconButton>
        </View>

        {/* more from this shelf */}
        {more.length > 0 && (
          <>
            <ThemedText variant="mono" tone="faint" style={{ marginTop: 28, marginBottom: 12, letterSpacing: 1 }}>MORE FROM {article.author.toUpperCase()}</ThemedText>
            {more.map((a) => (
              <Pressable key={a.id} onPress={() => router.replace(`/read/${a.id}`)} style={[styles.moreCard, { borderColor: t.border, backgroundColor: t.id === 'ember' ? t.surfaceGlass : t.surface }]}>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="label" numberOfLines={2}>{a.title}</ThemedText>
                  <ThemedText variant="meta" tone="faint" style={{ marginTop: 3 }}>{a.readingMinutes} min read</ThemedText>
                </View>
                <Icon name="chevron" size={18} color={t.text3} />
              </Pressable>
            ))}
          </>
        )}
      </Animated.ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  byline: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  sizeGroup: { flexDirection: 'row', gap: 4 },
  sizeBtn: { width: 38, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  fontBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
  keepRow: { marginTop: 24, flexDirection: 'row' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 20, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth },
  moreCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
});
