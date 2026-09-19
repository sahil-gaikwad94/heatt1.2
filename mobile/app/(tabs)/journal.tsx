import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../src/ui/Screen';
import { ThemedText } from '../../src/ui/Text';
import { Icon } from '../../src/ui/Icon';
import { Card } from '../../src/ui/Surface';
import { Button, IconButton } from '../../src/ui/Pressables';
import { Segmented } from '../../src/ui/Segmented';
import { Companion } from '../../src/features/Companion';
import { JournalComposeSheet } from '../../src/features/JournalComposeSheet';
import { CapsuleSheet } from '../../src/features/CapsuleSheet';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useStore } from '../../src/state/store';
import { timeAgo } from '../../src/lib/format';

const TABS = ['Notes', 'Capsules'];

export default function Journal() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { state, openCapsule } = useStore();
  const [tab, setTab] = useState('Notes');
  const [composing, setComposing] = useState(false);
  const [sealingCapsule, setSealingCapsule] = useState(false);

  const companionId = t.id === 'paper' ? 'ink' : t.id === 'midnight' ? 'dusk' : 'lumen';

  return (
    <ScreenBackground>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <View style={styles.head}>
          <View>
            <ThemedText variant="title">Journal</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <Icon name="lock" size={12} color={t.text3} />
              <ThemedText variant="meta" tone="faint">Private by construction — never shared, ranked, or searched.</ThemedText>
            </View>
          </View>
        </View>
        <View style={{ marginTop: 14 }}>
          <Segmented options={TABS} value={tab} onChange={setTab} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }}>
        {tab === 'Notes' && (
          state.journal.length > 0 ? state.journal.map((j) => (
            <Card key={j.id} style={styles.entry}>
              {j.quote ? <ThemedText serif style={{ fontStyle: 'italic', fontSize: 16, lineHeight: 24 }}>“{j.quote}”</ThemedText> : null}
              {j.note ? <ThemedText variant="body" style={{ marginTop: j.quote ? 8 : 0 }}>{j.note}</ThemedText> : null}
              <ThemedText variant="meta" tone="faint" style={{ marginTop: 10 }}>{j.source ? `${j.source} · ` : ''}{timeAgo(j.createdAt)}</ThemedText>
            </Card>
          )) : (
            <View style={styles.empty}>
              <Companion id={companionId} size={100} />
              <ThemedText variant="heading" style={{ marginTop: 16, textAlign: 'center' }}>A quiet place for your own words</ThemedText>
              <ThemedText variant="body" tone="muted" style={{ textAlign: 'center', marginTop: 6 }}>
                Keep a line while reading, or write a private note. {t.companion === 'Ink' ? 'Ink' : 'Lumen'} carries kept lines here.
              </ThemedText>
            </View>
          )
        )}

        {tab === 'Capsules' && (
          <>
            <Card style={styles.capsuleIntro} glass={t.id === 'ember'}>
              <Icon name="clock" size={20} color={t.accent} />
              <View style={{ flex: 1 }}>
                <ThemedText variant="label">Time Capsules</ThemedText>
                <ThemedText variant="meta" tone="muted">Write to your future self. Sealed until the day you choose.</ThemedText>
              </View>
            </Card>
            {state.capsules.map((c) => {
              const ready = Date.now() >= c.revealAt;
              const opened = !!c.openedAt;
              return (
                <Pressable key={c.id} onPress={() => ready && !opened && openCapsule(c.id)}>
                  <Card style={styles.capsule}>
                    <Icon name={opened ? 'quote' : 'lock'} size={18} color={ready ? t.accent : t.text3} />
                    <View style={{ flex: 1 }}>
                      {opened ? (
                        <ThemedText variant="body">{c.content}</ThemedText>
                      ) : (
                        <ThemedText variant="body" tone="muted">
                          {ready ? 'Ready to open — tap to unfurl.' : `Sealed until ${new Date(c.revealAt).toLocaleDateString()}`}
                        </ThemedText>
                      )}
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <View style={[styles.fab, { bottom: insets.bottom + 96 }]}>
        <IconButton
          label={tab === 'Notes' ? 'New note' : 'New capsule'}
          onPress={() => (tab === 'Notes' ? setComposing(true) : setSealingCapsule(true))}
          size={56}
          variant="accent"
        >
          <Icon name="plus" size={24} color={t.onAccent} strokeWidth={2.4} />
        </IconButton>
      </View>

      <JournalComposeSheet visible={composing} onClose={() => setComposing(false)} />
      <CapsuleSheet visible={sealingCapsule} onClose={() => setSealingCapsule(false)} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  entry: { marginBottom: 12 },
  empty: { alignItems: 'center', paddingHorizontal: 30, paddingTop: 50 },
  capsuleIntro: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  capsule: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  fab: { position: 'absolute', right: 20 },
});
