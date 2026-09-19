import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../src/ui/Screen';
import { BackHeader } from '../../src/ui/BackHeader';
import { ThemedText } from '../../src/ui/Text';
import { Card } from '../../src/ui/Surface';
import { Icon } from '../../src/ui/Icon';
import { Button, IconButton } from '../../src/ui/Pressables';
import { Segmented } from '../../src/ui/Segmented';
import { CreateRoomSheet } from '../../src/features/CreateRoomSheet';
import { JoinRoomSheet } from '../../src/features/JoinRoomSheet';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useStore } from '../../src/state/store';
import { useToast } from '../../src/ui/Toast';

const TABS = ['Discover', 'Your rooms'];

export default function Rooms() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { allRooms, state, joinRoom, leaveRoom } = useStore();
  const [tab, setTab] = useState('Discover');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const discover = allRooms.filter((r) => r.privacy === 'public');
  const yours = allRooms.filter((r) => state.joinedRooms.includes(r.id));

  const list = tab === 'Discover' ? discover : yours;

  return (
    <ScreenBackground>
      <BackHeader title="Rooms" right={
        <IconButton label="Join by code" onPress={() => setJoining(true)} size={40} variant={t.id === 'ember' ? 'glass' : 'surface'}>
          <Icon name="link" size={18} color={t.text} />
        </IconButton>
      } />
      <View style={{ paddingHorizontal: 16, marginTop: 6 }}>
        <Segmented options={TABS} value={tab} onChange={setTab} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }}>
        {list.length === 0 && (
          <View style={styles.empty}>
            <Icon name="users" size={30} color={t.text3} />
            <ThemedText variant="heading" style={{ marginTop: 12, textAlign: 'center' }}>
              {tab === 'Discover' ? 'No public rooms yet' : 'You haven’t joined a room'}
            </ThemedText>
            <ThemedText variant="body" tone="muted" style={{ textAlign: 'center', marginTop: 6 }}>
              Rooms are places, never pre-made circles. Make one, or join with an invite.
            </ThemedText>
          </View>
        )}
        {list.map((r) => {
          const joined = state.joinedRooms.includes(r.id);
          const owner = r.ownerId === 'user';
          return (
            <Pressable key={r.id} onPress={() => router.push(`/rooms/${r.id}`)}>
              <Card style={styles.card}>
                <View style={styles.cardHead}>
                  <View style={[styles.privacyTag, { backgroundColor: t.surface2 }]}>
                    <Icon name={r.privacy === 'private' ? 'lock' : 'globe'} size={12} color={t.text2} />
                    <ThemedText variant="mono" tone="muted">{r.privacy}</ThemedText>
                  </View>
                  {owner && <ThemedText variant="mono" tone="accent">HOST</ThemedText>}
                </View>
                <ThemedText variant="heading" style={{ marginTop: 8 }}>{r.name}</ThemedText>
                <ThemedText variant="body" tone="muted" numberOfLines={2} style={{ marginTop: 4 }}>{r.description}</ThemedText>
                <View style={styles.cardFoot}>
                  <ThemedText variant="meta" tone="faint">{r.topic} · {r.members.length} {r.members.length === 1 ? 'member' : 'members'}</ThemedText>
                  <Button
                    label={joined ? 'Joined' : 'Join'}
                    size="sm"
                    variant={joined ? 'outline' : 'primary'}
                    onPress={() => {
                      if (joined) { leaveRoom(r.id); toast.show({ message: `Left ${r.name}` }); }
                      else { joinRoom(r.id); toast.show({ message: `Joined ${r.name}` }); }
                    }}
                  />
                </View>
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.fab, { bottom: insets.bottom + 96 }]}>
        <Button label="New room" icon={<Icon name="plus" size={18} color={t.onAccent} strokeWidth={2.4} />} onPress={() => setCreating(true)} />
      </View>

      <CreateRoomSheet visible={creating} onClose={() => setCreating(false)} />
      <JoinRoomSheet visible={joining} onClose={() => setJoining(false)} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingHorizontal: 30, paddingTop: 60 },
  card: { marginBottom: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  privacyTag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cardFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  fab: { position: 'absolute', right: 20 },
});
