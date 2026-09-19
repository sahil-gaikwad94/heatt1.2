import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Sheet } from '../ui/Sheet';
import { ThemedText } from '../ui/Text';
import { Button } from '../ui/Pressables';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../state/store';
import { useToast } from '../ui/Toast';

export function JournalComposeSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const { addJournal } = useStore();
  const toast = useToast();
  const [note, setNote] = useState('');

  const save = () => {
    if (!note.trim()) return;
    addJournal({ source: '', quote: '', note: note.trim() });
    setNote('');
    toast.show({ message: 'Kept in your private journal.' });
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Private note">
      <View style={{ paddingBottom: 8 }}>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Something you want to remember…"
          placeholderTextColor={t.text3}
          multiline
          autoFocus
          style={[styles.input, { color: t.text, backgroundColor: t.surface, borderColor: t.border }]}
        />
        <ThemedText variant="meta" tone="faint" style={{ marginTop: 8 }}>
          Only you can see this. It never feeds the feed or search.
        </ThemedText>
        <Button label="Keep note" full style={{ marginTop: 16 }} onPress={save} disabled={!note.trim()} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 16, padding: 16, minHeight: 130, fontSize: 16, lineHeight: 24, textAlignVertical: 'top' },
});
