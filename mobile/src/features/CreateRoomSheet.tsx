import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet } from '../ui/Sheet';
import { ThemedText } from '../ui/Text';
import { Button, Chip } from '../ui/Pressables';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../state/store';
import { useToast } from '../ui/Toast';
import { blogCategories } from '../data/catalog';

export function CreateRoomSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const router = useRouter();
  const { createRoom } = useStore();
  const toast = useToast();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [topic, setTopic] = useState(blogCategories[0]);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');

  const valid = name.trim().length > 1;

  const create = () => {
    if (!valid) return;
    const room = createRoom({ name: name.trim(), description: desc.trim() || 'A room for people who care about this.', topic, privacy });
    setName(''); setDesc('');
    onClose();
    toast.show({ message: `${room.name} created. Invite code: ${room.inviteCode}` });
    router.push(`/rooms/${room.id}`);
  };

  const input = (label: string, value: string, set: (s: string) => void, opts?: { multiline?: boolean; placeholder?: string }) => (
    <View style={{ marginTop: 16 }}>
      <ThemedText variant="mono" tone="faint" style={{ marginBottom: 6, letterSpacing: 1 }}>{label.toUpperCase()}</ThemedText>
      <TextInput
        value={value}
        onChangeText={set}
        placeholder={opts?.placeholder}
        placeholderTextColor={t.text3}
        multiline={opts?.multiline}
        style={[styles.input, { color: t.text, backgroundColor: t.surface, borderColor: t.border, minHeight: opts?.multiline ? 72 : 46, textAlignVertical: opts?.multiline ? 'top' : 'center' }]}
      />
    </View>
  );

  return (
    <Sheet visible={visible} onClose={onClose} title="New room" fullHeight>
      <View style={{ paddingBottom: 8 }}>
        {input('Name', name, setName, { placeholder: 'e.g. Slow reading club' })}
        {input('What it’s for', desc, setDesc, { multiline: true, placeholder: 'A sentence so people know if they belong.' })}

        <ThemedText variant="mono" tone="faint" style={styles.section}>TOPIC</ThemedText>
        <View style={styles.chips}>
          {blogCategories.slice(0, 8).map((c) => (
            <Chip key={c} label={c} active={topic === c} onPress={() => setTopic(c)} />
          ))}
        </View>

        <ThemedText variant="mono" tone="faint" style={styles.section}>PRIVACY</ThemedText>
        <View style={styles.chips}>
          <Chip label="Public — anyone can find & join" active={privacy === 'public'} onPress={() => setPrivacy('public')} />
          <Chip label="Private — invite only" active={privacy === 'private'} onPress={() => setPrivacy('private')} />
        </View>

        <Button label="Create room" full style={{ marginTop: 22 }} onPress={create} disabled={!valid} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  section: { marginTop: 18, marginBottom: 10, letterSpacing: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
