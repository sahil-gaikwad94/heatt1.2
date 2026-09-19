import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Sheet } from '../ui/Sheet';
import { ThemedText } from '../ui/Text';
import { Button } from '../ui/Pressables';
import { Avatar } from '../ui/Avatar';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../state/store';
import { useToast } from '../ui/Toast';
import { initialsOf } from '../lib/format';

export function EditProfileSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const { state, updateProfile } = useStore();
  const toast = useToast();
  const [name, setName] = useState(state.profile.name);
  const [handle, setHandle] = useState(state.profile.handle);
  const [bio, setBio] = useState(state.profile.bio);

  useEffect(() => {
    if (visible) {
      setName(state.profile.name);
      setHandle(state.profile.handle);
      setBio(state.profile.bio);
    }
  }, [visible, state.profile]);

  const save = () => {
    updateProfile({ name: name.trim() || 'Reader', handle: handle.trim().replace(/[^a-zA-Z0-9_.]/g, '') || 'reader', bio: bio.trim() });
    toast.show({ message: 'Profile saved.' });
    onClose();
  };

  const field = (label: string, value: string, set: (s: string) => void, opts?: { multiline?: boolean; max?: number }) => (
    <View style={{ marginTop: 16 }}>
      <ThemedText variant="mono" tone="faint" style={{ marginBottom: 6, letterSpacing: 1 }}>{label.toUpperCase()}</ThemedText>
      <TextInput
        value={value}
        onChangeText={(x) => set(opts?.max ? x.slice(0, opts.max) : x)}
        multiline={opts?.multiline}
        style={[styles.input, { color: t.text, borderColor: t.border, backgroundColor: t.surface, minHeight: opts?.multiline ? 80 : 46, textAlignVertical: opts?.multiline ? 'top' : 'center' }]}
        placeholderTextColor={t.text3}
      />
    </View>
  );

  return (
    <Sheet visible={visible} onClose={onClose} title="Edit profile">
      <View style={{ paddingBottom: 8 }}>
        <View style={{ alignItems: 'center', marginTop: 4 }}>
          <Avatar initials={initialsOf(name)} accent="user" size={72} avatarData={state.profile.avatarData} />
        </View>
        {field('Name', name, setName, { max: 40 })}
        {field('Handle', handle, setHandle, { max: 24 })}
        {field('Bio', bio, setBio, { multiline: true, max: 160 })}
        <ThemedText variant="meta" tone="faint" style={{ textAlign: 'right', marginTop: 4 }}>{bio.length}/160</ThemedText>
        <Button label="Save profile" full style={{ marginTop: 18 }} onPress={save} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
});
