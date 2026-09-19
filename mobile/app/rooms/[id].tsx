import React, { useState } from 'react';
import { View, ScrollView, TextInput, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../src/ui/Screen';
import { BackHeader } from '../../src/ui/BackHeader';
import { ThemedText } from '../../src/ui/Text';
import { Card } from '../../src/ui/Surface';
import { Icon } from '../../src/ui/Icon';
import { Avatar } from '../../src/ui/Avatar';
import { Button } from '../../src/ui/Pressables';
import { FlareCard } from '../../src/ui/FlareCard';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useStore } from '../../src/state/store';
import { useToast } from '../../src/ui/Toast';

export default function RoomDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { allRooms, allFlares, state, joinRoom, leaveRoom, addMemberToRoom } = useStore();
  const [invite, setInvite] = useState('');
  const room = allRooms.find((r) => r.id === id);

  if (!room) {
    return (
      <ScreenBackground>
        <BackHeader title="Room" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ThemedText variant="body" tone="muted">This room no longer exists.</ThemedText>
        </View>
      </ScreenBackground>
    );
  }

  const joined = state.joinedRooms.includes(room.id);
  const owner = room.ownerId === 'user';
  const roomFlares = allFlares.filter((f) => f.room === room.name);

  return (
    <ScreenBackground>
      <BackHeader title={room.name} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }}>
        <Card glass={t.id === 'ember'}>
          <View style={styles.headRow}>
            <View style={[styles.privacyTag, { backgroundColor: t.surface2 }]}>
              <Icon name={room.privacy === 'private' ? 'lock' : 'globe'} size={12} color={t.text2} />
              <ThemedText variant="mono" tone="muted">{room.privacy}</ThemedText>
            </View>
            <ThemedText variant="meta" tone="faint">{room.topic}</ThemedText>
          </View>
          <ThemedText variant="title" style={{ marginTop: 10 }}>{room.name}</ThemedText>
          <ThemedText variant="body" tone="muted" style={{ marginTop: 6 }}>{room.description}</ThemedText>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <Button
              label={joined ? 'Leave room' : 'Join room'}
              variant={joined ? 'outline' : 'primary'}
              onPress={() => { joined ? (leaveRoom(room.id), toast.show({ message: 'Left the room' })) : (joinRoom(room.id), toast.show({ message: 'Joined the room' })); }}
            />
            <Button label="Copy invite" variant="outline" icon={<Icon name="link" size={15} color={t.text} />} onPress={() => toast.show({ message: `Invite code ${room.inviteCode} copied.` })} />
          </View>
        </Card>

        {/* members + invite by username (host only) */}
        <ThemedText variant="mono" tone="faint" style={styles.section}>MEMBERS ({room.members.length})</ThemedText>
        <Card>
          <View style={styles.memberRow}>
            {room.members.length === 0 && <ThemedText variant="body" tone="muted">No members yet — invite someone.</ThemedText>}
            {room.members.slice(0, 8).map((m) => (
              <View key={m} style={styles.member}>
                <Avatar initials={(m === 'user' ? state.profile.name : m).slice(0, 2).toUpperCase()} accent="user" size={36} />
                <ThemedText variant="meta" tone="muted" numberOfLines={1} style={{ maxWidth: 60, marginTop: 4 }}>{m === 'user' ? 'You' : `@${m}`}</ThemedText>
              </View>
            ))}
          </View>
          {owner && (
            <View style={[styles.inviteRow, { borderTopColor: t.border }]}>
              <View style={[styles.inviteInput, { backgroundColor: t.surface2 }]}>
                <ThemedText tone="faint">@</ThemedText>
                <TextInput
                  value={invite}
                  onChangeText={setInvite}
                  placeholder="add by username"
                  placeholderTextColor={t.text3}
                  autoCapitalize="none"
                  style={[styles.tInput, { color: t.text }]}
                />
              </View>
              <Button label="Add" size="sm" onPress={() => {
                if (addMemberToRoom(room.id, invite)) { toast.show({ message: `Invited @${invite.replace(/^@/, '')}` }); setInvite(''); }
              }} disabled={invite.trim().length < 2} />
            </View>
          )}
        </Card>

        {/* room feed */}
        <ThemedText variant="mono" tone="faint" style={styles.section}>IN THIS ROOM</ThemedText>
        {roomFlares.length > 0 ? roomFlares.map((f) => <FlareCard key={f.id} flare={f} />) : (
          <Card style={{ alignItems: 'center', padding: 24 }} glass={t.id === 'ember'}>
            <ThemedText variant="body" tone="muted" style={{ textAlign: 'center' }}>
              No flares in this room yet. {joined ? 'Be the first — post and pick this room.' : 'Join to start the conversation.'}
            </ThemedText>
          </Card>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  privacyTag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  section: { marginTop: 22, marginBottom: 10, letterSpacing: 1 },
  memberRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  member: { alignItems: 'center', width: 62 },
  inviteRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth },
  inviteInput: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  tInput: { flex: 1, fontSize: 15 },
});
