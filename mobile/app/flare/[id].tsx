import React, { useState } from 'react';
import { View, ScrollView, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../src/ui/Screen';
import { BackHeader } from '../../src/ui/BackHeader';
import { ThemedText } from '../../src/ui/Text';
import { Card } from '../../src/ui/Surface';
import { Avatar } from '../../src/ui/Avatar';
import { Icon } from '../../src/ui/Icon';
import { IconButton, Button } from '../../src/ui/Pressables';
import { HeatButton } from '../../src/ui/HeatButton';
import { ShareSheet } from '../../src/features/ShareSheet';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useStore } from '../../src/state/store';
import { timeAgo } from '../../src/lib/format';
import type { Flare } from '../../src/state/types';
import { Haptics } from '../../src/motion/motion';

export default function FlareDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { allFlares, state, authorFor, addComment, setHeat, toggleSave, toggleRepost } = useStore();
  const [reply, setReply] = useState('');
  const [share, setShare] = useState<Flare | null>(null);

  const flare = allFlares.find((f) => f.id === id);
  if (!flare) {
    return (
      <ScreenBackground>
        <BackHeader title="Flare" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ThemedText tone="muted">This flare is gone.</ThemedText>
        </View>
      </ScreenBackground>
    );
  }

  const author = authorFor(flare.authorId);
  const accent = (author as any).accent ?? 'coral';
  const heat = state.reactions[flare.id] ?? 0;
  const comments = state.comments.filter((c) => c.flareId === flare.id);
  const isPoem = flare.type === 'Poem';

  const send = () => {
    if (!reply.trim()) return;
    addComment(flare.id, reply.trim());
    setReply('');
    Haptics.success();
  };

  return (
    <ScreenBackground>
      <BackHeader title="Flare" right={
        <IconButton label="Share" onPress={() => setShare(flare)} size={40} variant={t.id === 'ember' ? 'glass' : 'surface'}>
          <Icon name="share" size={17} color={t.text} />
        </IconButton>
      } />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <Card glass={t.id === 'ember'}>
            <View style={styles.authorRow}>
              <Avatar initials={author.initials} accent={accent} size={44} avatarData={(author as any).avatarData} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <ThemedText variant="label">{author.name}</ThemedText>
                <ThemedText variant="meta" tone="faint">{author.isPublisher ? author.domain : `@${author.handle}`} · {timeAgo(flare.createdAt)}</ThemedText>
              </View>
            </View>
            <View style={styles.metaRow}>
              <View style={[styles.typeTag, { backgroundColor: t.surface2 }]}>
                <ThemedText variant="mono" tone="muted">{flare.type}</ThemedText>
              </View>
              <ThemedText variant="meta" tone="faint">{flare.topic}{flare.invitation ? ` · ${flare.invitation}` : ''}</ThemedText>
            </View>
            {flare.title && <ThemedText variant="title" serif style={{ marginTop: 12 }}>{flare.title}</ThemedText>}
            <ThemedText variant="read" serif={isPoem} style={[{ marginTop: 10 }, isPoem && { textAlign: 'center', fontStyle: 'italic' }]}>{flare.text}</ThemedText>

            {flare.type === 'Article' && flare.articleId && (
              <View style={{ marginTop: 16 }}>
                <Button label="Read in Heatt" icon={<Icon name="book" size={16} color={t.onAccent} />} onPress={() => router.push(`/read/${flare.articleId}`)} />
              </View>
            )}

            <View style={[styles.actions, { borderTopColor: t.border }]}>
              <HeatButton level={heat} onSet={(n) => setHeat(flare.id, n)} />
              <View style={styles.action}><Icon name="message" size={19} color={t.text2} /><ThemedText variant="meta" tone="muted">{comments.length}</ThemedText></View>
              <IconButton label="Repost" size={34} onPress={() => toggleRepost(flare.id)}>
                <Icon name="repost" size={18} color={state.reposts.includes(flare.id) ? t.success : t.text2} />
              </IconButton>
              <IconButton label="Save" size={34} onPress={() => toggleSave(flare.id)}>
                <Icon name={state.saved.includes(flare.id) ? 'bookmark-fill' : 'bookmark'} size={18} color={state.saved.includes(flare.id) ? t.accent : t.text2} />
              </IconButton>
            </View>
          </Card>

          <ThemedText variant="mono" tone="faint" style={styles.section}>
            {comments.length} {comments.length === 1 ? 'REPLY' : 'REPLIES'}
          </ThemedText>
          {comments.length === 0 && <ThemedText variant="body" tone="muted">Be the first to reply. Thoughtful beats fast.</ThemedText>}
          {comments.map((c) => {
            const ca = authorFor(c.authorId);
            return (
              <View key={c.id} style={styles.comment}>
                <Avatar initials={ca.initials} accent={(ca as any).accent ?? 'user'} size={34} avatarData={(ca as any).avatarData} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <ThemedText variant="label">{ca.name} <ThemedText variant="meta" tone="faint">· {timeAgo(c.createdAt)}</ThemedText></ThemedText>
                  <ThemedText variant="body" style={{ marginTop: 2 }}>{c.text}</ThemedText>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* sticky reply bar */}
        <View style={[styles.replyBar, { backgroundColor: t.bgElevated, borderTopColor: t.border, paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            value={reply}
            onChangeText={(x) => setReply(x.slice(0, 500))}
            placeholder="Write a reply…"
            placeholderTextColor={t.text3}
            style={[styles.replyInput, { color: t.text, backgroundColor: t.surface2 }]}
            multiline
          />
          <IconButton label="Send reply" onPress={send} size={44} variant="accent">
            <Icon name="send" size={19} color={t.onAccent} />
          </IconButton>
        </View>
      </KeyboardAvoidingView>
      <ShareSheet flare={share} onClose={() => setShare(null)} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  typeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 16, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  section: { marginTop: 22, marginBottom: 12, letterSpacing: 1 },
  comment: { flexDirection: 'row', marginBottom: 16 },
  replyBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 14, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  replyInput: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 11, fontSize: 15, maxHeight: 100 },
});
