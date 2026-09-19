import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sheet } from '../ui/Sheet';
import { ThemedText } from '../ui/Text';
import { Button } from '../ui/Pressables';
import { Icon } from '../ui/Icon';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../state/store';
import { useToast } from '../ui/Toast';
import type { Flare } from '../state/types';
import { accentTint } from '../ui/palette';

export function ShareSheet({ flare, onClose }: { flare: Flare | null; onClose: () => void }) {
  const t = useTheme();
  const { authorFor } = useStore();
  const toast = useToast();
  if (!flare) return null;
  const author = authorFor(flare.authorId);
  const accent = (author as any).accent ?? 'coral';
  const [a, b] = accentTint(accent);

  return (
    <Sheet visible={!!flare} onClose={onClose} title="Share this flare">
      <View style={{ paddingBottom: 8 }}>
        {/* The shareable card — rendered live, on-device */}
        <View style={[styles.card, { borderColor: t.border }]}>
          <LinearGradient colors={[a, b]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={styles.cardTop}>
            <View style={styles.brand}>
              <View style={styles.mark}><Icon name="fire" size={14} color={b} /></View>
              <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>heatt</ThemedText>
            </View>
            <ThemedText variant="mono" style={{ color: 'rgba(255,255,255,0.8)' }}>{flare.type.toUpperCase()}</ThemedText>
          </View>
          <ThemedText serif style={styles.quote} numberOfLines={6}>
            {flare.title ? `${flare.title}. ` : ''}{flare.text}
          </ThemedText>
          <View style={styles.cardFoot}>
            <ThemedText style={{ color: '#fff', fontWeight: '700' }}>{author.name}</ThemedText>
            <ThemedText style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
              {author.isPublisher ? author.domain : `@${author.handle}`} · where your mind catches fire
            </ThemedText>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            label="Copy link"
            variant="outline"
            full
            icon={<Icon name="link" size={16} color={t.text} />}
            onPress={() => { toast.show({ message: 'Link copied to clipboard.' }); onClose(); }}
          />
          <View style={{ height: 10 }} />
          <Button
            label="Share as story"
            full
            icon={<Icon name="spark" size={16} color={t.onAccent} />}
            onPress={() => { toast.show({ message: 'Story card ready to share.' }); onClose(); }}
          />
        </View>
        <View style={styles.note}>
          <Icon name="lock" size={12} color={t.text3} />
          <ThemedText variant="meta" tone="faint" style={{ flex: 1 }}>
            This card is made on your device. Your private journal never leaves it.
          </ThemedText>
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, overflow: 'hidden', padding: 22, minHeight: 260, justifyContent: 'space-between', borderWidth: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  mark: { width: 26, height: 26, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  quote: { color: '#fff', fontSize: 22, lineHeight: 30, fontWeight: '600', marginVertical: 20 },
  cardFoot: { gap: 2 },
  actions: { marginTop: 18 },
  note: { flexDirection: 'row', gap: 8, marginTop: 16, alignItems: 'center' },
});
