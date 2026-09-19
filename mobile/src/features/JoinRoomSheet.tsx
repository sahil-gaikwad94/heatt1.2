import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet } from '../ui/Sheet';
import { ThemedText } from '../ui/Text';
import { Button } from '../ui/Pressables';
import { Icon } from '../ui/Icon';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../state/store';
import { useToast } from '../ui/Toast';

export function JoinRoomSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const router = useRouter();
  const { joinRoomByCode } = useStore();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const join = () => {
    const room = joinRoomByCode(code);
    if (room) {
      setCode(''); setError('');
      onClose();
      toast.show({ message: `Joined ${room.name}` });
      router.push(`/rooms/${room.id}`);
    } else {
      setError('No room matches that code. Check with whoever invited you.');
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Join a room">
      <View style={{ paddingBottom: 8 }}>
        <ThemedText variant="body" tone="muted">Paste an invite code or link. Rooms are private unless the host made them public.</ThemedText>
        <View style={[styles.inputRow, { backgroundColor: t.surface, borderColor: error ? t.danger : t.border }]}>
          <Icon name="link" size={18} color={t.text3} />
          <TextInput
            value={code}
            onChangeText={(x) => { setCode(x); setError(''); }}
            placeholder="e.g. SLOWREAD"
            placeholderTextColor={t.text3}
            autoCapitalize="characters"
            style={[styles.input, { color: t.text }]}
          />
        </View>
        {error ? <ThemedText variant="meta" tone="danger" style={{ marginTop: 8 }}>{error}</ThemedText> : null}
        <Button label="Join room" full style={{ marginTop: 18 }} onPress={join} disabled={code.trim().length < 3} />
        <ThemedText variant="meta" tone="faint" style={{ textAlign: 'center', marginTop: 12 }}>
          Try the sample codes: SLOWREAD, MORNING, QUESTIONS
        </ThemedText>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginTop: 16 },
  input: { flex: 1, fontSize: 16, letterSpacing: 1 },
});
