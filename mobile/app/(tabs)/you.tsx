import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../src/ui/Screen';
import { ThemedText } from '../../src/ui/Text';
import { Avatar } from '../../src/ui/Avatar';
import { Icon } from '../../src/ui/Icon';
import { Card } from '../../src/ui/Surface';
import { Button, IconButton, Chip } from '../../src/ui/Pressables';
import { Segmented } from '../../src/ui/Segmented';
import { FlareCard } from '../../src/ui/FlareCard';
import { Companion } from '../../src/features/Companion';
import { HeatOrb } from '../../src/features/HeatOrb';
import { EditProfileSheet } from '../../src/features/EditProfileSheet';
import { ShareSheet } from '../../src/features/ShareSheet';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useStore } from '../../src/state/store';
import { useToast } from '../../src/ui/Toast';
import type { Flare } from '../../src/state/types';

const TABS = ['Flares', 'Saved', 'Journal'];

export default function You() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { state, allFlares, authorFor, signIn } = useStore();
  const [tab, setTab] = useState('Flares');
  const [editing, setEditing] = useState(false);
  const [shareFlare, setShareFlare] = useState<Flare | null>(null);
  const user = authorFor('user');

  const myFlares = allFlares.filter((f) => f.authorId === 'user');
  const savedFlares = allFlares.filter((f) => state.saved.includes(f.id));
  const heatGiven = Object.keys(state.reactions).length;

  const companionId = t.id === 'paper' ? 'ink' : t.id === 'midnight' ? 'dusk' : 'kindle';

  const stats = [
    { label: 'Flares', value: myFlares.length },
    { label: 'Heat given', value: heatGiven },
    { label: 'Saved', value: state.saved.length },
  ];

  return (
    <ScreenBackground>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'flex-end', gap: 4 }}>
        <IconButton label="Settings" onPress={() => router.push('/settings')} size={40} variant={t.id === 'ember' ? 'glass' : 'surface'}>
          <Icon name="settings" size={20} color={t.text} />
        </IconButton>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {/* profile header */}
        <View style={styles.header}>
          <Avatar initials={user.initials} accent="user" size={82} avatarData={(user as any).avatarData} />
          <ThemedText variant="title" style={{ marginTop: 12 }}>{state.profile.name}</ThemedText>
          <ThemedText variant="meta" tone="faint">@{state.profile.handle}</ThemedText>
          {state.profile.bio ? <ThemedText variant="body" tone="muted" style={{ textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }}>{state.profile.bio}</ThemedText> : null}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <Button label="Edit profile" variant="outline" size="sm" icon={<Icon name="edit" size={14} color={t.text} />} onPress={() => setEditing(true)} />
            {!state.signedIn && <Button label="Sign in" size="sm" onPress={() => { signIn(); toast.show({ message: 'Signed in on this device.' }); }} />}
          </View>
        </View>

        {/* stat trio — Paper inverse blocks, others soft */}
        <View style={styles.stats}>
          {stats.map((s, i) => (
            <View
              key={s.label}
              style={[
                styles.statBlock,
                t.id === 'paper'
                  ? { backgroundColor: i === 1 ? t.text : t.surface, borderColor: t.border, borderWidth: 1 }
                  : { backgroundColor: t.id === 'ember' ? t.surfaceGlass : t.surface, borderColor: t.border, borderWidth: 1 },
              ]}
            >
              <ThemedText variant="title" style={{ color: t.id === 'paper' && i === 1 ? t.onAccent : t.text }}>{s.value}</ThemedText>
              <ThemedText variant="meta" style={{ color: t.id === 'paper' && i === 1 ? 'rgba(255,255,255,0.7)' : t.text3 }}>{s.label}</ThemedText>
            </View>
          ))}
        </View>

        {/* companion card */}
        <View style={{ paddingHorizontal: 16 }}>
          <Card style={styles.companionCard} glass={t.id === 'ember'}>
            {t.id === 'ember' ? <HeatOrb size={92} /> : <Companion id={companionId} size={72} onBoop={() => toast.show({ message: `${t.companion} says hi.` })} />}
            <View style={{ flex: 1 }}>
              <ThemedText variant="label">{t.companion}, your companion</ThemedText>
              <ThemedText variant="meta" tone="muted">
                {state.exploredShelves.length} of 13 shelves explored. Growth is about what you’ve found, never what you missed.
              </ThemedText>
            </View>
          </Card>
        </View>

        {/* tabs */}
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <Segmented options={TABS} value={tab} onChange={setTab} />
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          {tab === 'Flares' && (myFlares.length > 0
            ? myFlares.map((f) => <FlareCard key={f.id} flare={f} onOpenShare={setShareFlare} />)
            : <Empty text="Your flares will live here. Tap + to write your first." />)}
          {tab === 'Saved' && (savedFlares.length > 0
            ? savedFlares.map((f) => <FlareCard key={f.id} flare={f} onOpenShare={setShareFlare} />)
            : <Empty text="Nothing saved yet. Tap the bookmark on any flare to keep it." />)}
          {tab === 'Journal' && (
            <Card style={{ alignItems: 'center', padding: 24 }}>
              <Icon name="lock" size={22} color={t.text3} />
              <ThemedText variant="heading" style={{ marginTop: 10 }}>Journal is private</ThemedText>
              <ThemedText variant="body" tone="muted" style={{ textAlign: 'center', marginTop: 6 }}>
                Your journal never appears here or anywhere public. Open it from the Journal tab.
              </ThemedText>
              <Button label="Open Journal" variant="outline" size="sm" style={{ marginTop: 14 }} onPress={() => router.push('/journal')} />
            </Card>
          )}
        </View>
      </ScrollView>

      <EditProfileSheet visible={editing} onClose={() => setEditing(false)} />
      <ShareSheet flare={shareFlare} onClose={() => setShareFlare(null)} />
    </ScreenBackground>
  );
}

function Empty({ text }: { text: string }) {
  const t = useTheme();
  return (
    <Card style={{ alignItems: 'center', padding: 28 }} glass={t.id === 'ember'}>
      <ThemedText variant="body" tone="muted" style={{ textAlign: 'center' }}>{text}</ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 6 },
  stats: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 20 },
  statBlock: { flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 16 },
  companionCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18 },
});
