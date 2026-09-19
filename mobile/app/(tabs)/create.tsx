import React, { useMemo, useState } from 'react';
import { View, ScrollView, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { ScreenBackground } from '../../src/ui/Screen';
import { ThemedText } from '../../src/ui/Text';
import { Chip, Button, IconButton } from '../../src/ui/Pressables';
import { Icon } from '../../src/ui/Icon';
import { Card } from '../../src/ui/Surface';
import { Companion } from '../../src/features/Companion';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useStore } from '../../src/state/store';
import { useToast } from '../../src/ui/Toast';
import { blogCategories } from '../../src/data/catalog';
import type { FlareType } from '../../src/state/types';

const TYPES: FlareType[] = ['Thought', 'Question', 'Practice', 'Poem'];
const LIMIT = 500;
const INVITES = ['Just sharing', 'Advice welcome', 'Questions welcome'] as const;

function graphemeCount(s: string): number {
  // Approximate grapheme count (code points), good enough for the ring.
  return Array.from(s).length;
}

export default function Create() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { addFlare, allRooms, state } = useStore();
  const [type, setType] = useState<FlareType>('Thought');
  const [text, setText] = useState('');
  const [topic, setTopic] = useState(state.preferences.topics[0] ?? blogCategories[0]);
  const [invite, setInvite] = useState<(typeof INVITES)[number]>('Just sharing');
  const [room, setRoom] = useState<string | undefined>(undefined);

  const count = graphemeCount(text);
  const over = count > LIMIT;
  const valid = text.trim().length > 0 && !over;
  const joinedRooms = allRooms.filter((r) => state.joinedRooms.includes(r.id));

  const ringPct = Math.min(1, count / LIMIT);
  const R = 15;
  const C = 2 * Math.PI * R;

  const publish = () => {
    if (!valid) return;
    addFlare({ type, topic, text: text.trim(), invitation: invite, room });
    toast.show({ message: 'Published to your feed.' });
    setText('');
    router.push('/');
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.head, { paddingTop: insets.top + 6 }]}>
          <IconButton label="Close" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} size={40} variant="surface">
            <Icon name="x" size={20} color={t.text} />
          </IconButton>
          <ThemedText variant="heading">New flare</ThemedText>
          <Pressable onPress={publish} disabled={!valid} style={[styles.publish, { backgroundColor: valid ? t.accentStrong : t.surface2 }]}>
            <ThemedText variant="label" tone={valid ? 'onAccent' : 'faint'}>Publish</ThemedText>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">
          {/* type chips */}
          <View style={styles.chipRow}>
            {TYPES.map((ty) => (
              <Chip key={ty} label={ty} active={type === ty} onPress={() => setType(ty)} variant={t.id === 'ember' ? 'dashed' : 'ghost'} />
            ))}
          </View>

          {/* editor */}
          <Card style={styles.editorCard} glass={t.id === 'ember'}>
            <View style={styles.editorHead}>
              <Companion id={t.id === 'paper' ? 'ink' : t.id === 'midnight' ? 'dusk' : 'kindle'} size={44} />
              <View style={{ flex: 1 }}>
                <ThemedText variant="label">{t.companion}</ThemedText>
                <ThemedText variant="meta" tone="faint">
                  {type === 'Question' ? 'Ask the room something real.' : type === 'Poem' ? 'Say it in as few words as it needs.' : 'Write something worth someone’s attention.'}
                </ThemedText>
              </View>
              {/* grapheme ring */}
              <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={40} height={40}>
                  <Circle cx={20} cy={20} r={R} stroke={t.border} strokeWidth={3} fill="none" />
                  <Circle
                    cx={20} cy={20} r={R}
                    stroke={over ? t.danger : t.accent}
                    strokeWidth={3}
                    fill="none"
                    strokeDasharray={C}
                    strokeDashoffset={C * (1 - ringPct)}
                    strokeLinecap="round"
                    transform="rotate(-90 20 20)"
                  />
                </Svg>
                <View style={{ position: 'absolute' }}>
                  <ThemedText variant="mono" tone={over ? 'danger' : 'faint'} style={{ fontSize: 9 }}>{LIMIT - count}</ThemedText>
                </View>
              </View>
            </View>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={type === 'Poem' ? 'a small poem…' : 'What’s on your mind?'}
              placeholderTextColor={t.text3}
              multiline
              style={[styles.input, { color: t.text, fontFamily: type === 'Poem' ? t.fontRead : t.fontUI, textAlign: type === 'Poem' ? 'center' : 'left', fontStyle: type === 'Poem' ? 'italic' : 'normal' }]}
              autoFocus
            />
          </Card>

          {/* topic */}
          <ThemedText variant="mono" tone="faint" style={styles.sectionLabel}>TOPIC</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {blogCategories.map((c) => (
              <Chip key={c} label={c} active={topic === c} onPress={() => setTopic(c)} />
            ))}
          </ScrollView>

          {/* invitation */}
          <ThemedText variant="mono" tone="faint" style={styles.sectionLabel}>INVITATION</ThemedText>
          <View style={styles.chipRow}>
            {INVITES.map((iv) => (
              <Chip key={iv} label={iv} active={invite === iv} onPress={() => setInvite(iv)} />
            ))}
          </View>

          {/* room */}
          {joinedRooms.length > 0 && (
            <>
              <ThemedText variant="mono" tone="faint" style={styles.sectionLabel}>POST TO A ROOM (OPTIONAL)</ThemedText>
              <View style={styles.chipRow}>
                <Chip label="No room" active={!room} onPress={() => setRoom(undefined)} />
                {joinedRooms.map((r) => (
                  <Chip key={r.id} label={r.name} active={room === r.name} onPress={() => setRoom(r.name)} />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 8 },
  publish: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  editorCard: { marginTop: 14, padding: 16 },
  editorHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { marginTop: 14, minHeight: 140, fontSize: 18, lineHeight: 26, textAlignVertical: 'top' },
  sectionLabel: { marginTop: 20, marginBottom: 10, letterSpacing: 1 },
  hScroll: { gap: 8, paddingRight: 8 },
});
