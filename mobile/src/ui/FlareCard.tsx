import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/ThemeProvider';
import { Card, elevation } from './Surface';
import { ThemedText } from './Text';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { HeatButton } from './HeatButton';
import { GenerativeCover } from './GenerativeCover';
import { useStore } from '../state/store';
import { timeAgo } from '../lib/format';
import type { Flare } from '../state/types';
import { Haptics } from '../motion/motion';

export function FlareCard({
  flare,
  onOpenShare,
  onOpenThread,
  onFollowToast,
}: {
  flare: Flare;
  onOpenShare?: (flare: Flare) => void;
  onOpenThread?: (flare: Flare) => void;
  onFollowToast?: (msg: string) => void;
}) {
  const t = useTheme();
  const router = useRouter();
  const { authorFor, state, setHeat, toggleSave, toggleRepost, toggleFollow } = useStore();
  const author = authorFor(flare.authorId);
  const heat = state.reactions[flare.id] ?? 0;
  const saved = state.saved.includes(flare.id);
  const reposted = state.reposts.includes(flare.id);
  const following = state.following.includes(flare.authorId);
  const replyCount = state.comments.filter((c) => c.flareId === flare.id).length;
  const isArticle = flare.type === 'Article';
  const isPoem = flare.type === 'Poem';

  const open = () => {
    if (isArticle && flare.articleId) router.push(`/read/${flare.articleId}`);
    else router.push(`/flare/${flare.id}`);
  };

  const accent = (author as any).accent ?? 'coral';

  // Midnight uses a notched card: the bookmark sits in a cut corner.
  const notched = t.id === 'midnight';

  return (
    <Card
      glass={t.id === 'ember'}
      padded={false}
      style={styles.card}
      level={2}
    >
      {/* corner action (notch on midnight, plain on others) */}
      <View style={[styles.cornerWrap]} pointerEvents="box-none">
        {notched && (
          <View style={[styles.notch, { backgroundColor: t.bg }]} pointerEvents="none" />
        )}
        <Pressable
          onPress={() => { Haptics.light(); toggleSave(flare.id); }}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove from saved' : 'Save'}
          style={[
            styles.cornerBtn,
            {
              backgroundColor: notched ? t.accentStrong : (saved ? t.accentStrong : t.surface2),
            },
          ]}
        >
          <Icon
            name={saved ? 'bookmark-fill' : 'bookmark'}
            size={17}
            color={notched ? t.onAccent : (saved ? t.onAccent : t.text2)}
          />
        </Pressable>
      </View>

      <Pressable onPress={open} accessibilityRole="button">
        <View style={styles.body}>
          {/* author row */}
          <View style={styles.authorRow}>
            <Avatar initials={author.initials} accent={accent} size={40} avatarData={(author as any).avatarData} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ThemedText variant="label" numberOfLines={1} style={{ flexShrink: 1 }}>{author.name}</ThemedText>
                {author.isPublisher && <Icon name="check" size={12} color={t.accent} />}
              </View>
              <ThemedText variant="meta" tone="faint" numberOfLines={1}>
                {author.isPublisher ? author.domain : `@${author.handle}`} · {timeAgo(flare.createdAt)}
              </ThemedText>
            </View>
            {author.isPublisher && author.id !== 'user' && (
              <Pressable
                onPress={() => { Haptics.light(); toggleFollow(flare.authorId); onFollowToast?.(following ? 'Unfollowed' : `Following ${author.name}`); }}
                style={[styles.followPill, { backgroundColor: following ? 'transparent' : t.accentStrong, borderColor: t.accentStrong, borderWidth: 1.5, marginRight: notched ? 44 : 0 }]}
                accessibilityRole="button"
                accessibilityLabel={following ? 'Unfollow' : 'Follow'}
              >
                <ThemedText variant="meta" style={{ fontWeight: '700', color: following ? t.accent : t.onAccent }}>
                  {following ? 'Following' : 'Follow'}
                </ThemedText>
              </Pressable>
            )}
          </View>

          {/* type + topic eyebrow */}
          <View style={styles.metaRow}>
            <View style={[styles.typeTag, { backgroundColor: t.surface2 }]}>
              <ThemedText variant="mono" tone="muted">{flare.type}</ThemedText>
            </View>
            <ThemedText variant="meta" tone="faint">{flare.topic}</ThemedText>
          </View>

          {/* title */}
          {flare.title && isArticle && (
            <ThemedText variant="heading" serif style={{ marginTop: 8 }} numberOfLines={2}>{flare.title}</ThemedText>
          )}

          {/* text */}
          <ThemedText
            variant={isArticle ? 'body' : 'read'}
            serif={isPoem || isArticle}
            style={[
              { marginTop: 6 },
              isPoem && { textAlign: 'center', fontStyle: 'italic' },
            ]}
            numberOfLines={isArticle ? 3 : 6}
          >
            {flare.text}
          </ThemedText>

          {/* article generative cover */}
          {isArticle && (
            <View style={{ marginTop: 12 }}>
              <GenerativeCover seed={flare.articleId ?? flare.sourceId ?? flare.id} accent={accent} height={120} radius={t.rMd} />
              <View style={styles.sourceRow}>
                <Icon name="book" size={13} color={t.text3} />
                <ThemedText variant="meta" tone="faint">Read in Heatt</ThemedText>
              </View>
            </View>
          )}

          {/* tags */}
          {flare.tags && flare.tags.length > 0 && (
            <View style={styles.tags}>
              {flare.tags.slice(0, 3).map((tag) => (
                <ThemedText key={tag} variant="meta" tone="faint">#{tag}</ThemedText>
              ))}
            </View>
          )}
        </View>
      </Pressable>

      {/* action row */}
      <View style={[styles.actions, { borderTopColor: t.border }]}>
        <HeatButton level={heat} onSet={(n) => setHeat(flare.id, n)} />
        <Pressable style={styles.action} onPress={() => (onOpenThread ? onOpenThread(flare) : open())} accessibilityRole="button" accessibilityLabel="Reply">
          <Icon name="message" size={19} color={t.text2} />
          {replyCount > 0 && <ThemedText variant="meta" tone="muted">{replyCount}</ThemedText>}
        </Pressable>
        <Pressable style={styles.action} onPress={() => { Haptics.light(); toggleRepost(flare.id); onFollowToast?.(reposted ? 'Repost removed' : 'Reposted'); }} accessibilityRole="button" accessibilityLabel="Repost">
          <Icon name="repost" size={18} color={reposted ? t.success : t.text2} />
        </Pressable>
        <Pressable style={styles.action} onPress={() => onOpenShare?.(flare)} accessibilityRole="button" accessibilityLabel="Share">
          <Icon name="share" size={17} color={t.text2} />
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 14, overflow: 'hidden' },
  body: { padding: 16, paddingBottom: 12 },
  cornerWrap: { position: 'absolute', top: 0, right: 0, zIndex: 10, width: 56, height: 56 },
  notch: { position: 'absolute', top: -2, right: -2, width: 54, height: 54, borderBottomLeftRadius: 28 },
  cornerBtn: { position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  authorRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 40 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  typeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  tags: { flexDirection: 'row', gap: 10, marginTop: 10 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 22, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 30, minWidth: 30 },
  followPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
});
