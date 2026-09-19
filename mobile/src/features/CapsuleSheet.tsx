import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Sheet } from '../ui/Sheet';
import { ThemedText } from '../ui/Text';
import { Button, Chip } from '../ui/Pressables';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../state/store';
import { useToast } from '../ui/Toast';

const PERIODS = [
  { label: '3 days', ms: 3 * 86400000 },
  { label: '1 week', ms: 7 * 86400000 },
  { label: '1 month', ms: 30 * 86400000 },
  { label: '1 year', ms: 365 * 86400000 },
];

export function CapsuleSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const { addCapsule } = useStore();
  const toast = useToast();
  const [content, setContent] = useState('');
  const [period, setPeriod] = useState(PERIODS[1]);

  const seal = () => {
    if (!content.trim()) return;
    addCapsule(content.trim(), Date.now() + period.ms);
    setContent('');
    toast.show({ message: `Sealed. Opens in ${period.label}.` });
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Time Capsule">
      <View style={{ paddingBottom: 8 }}>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="A letter to your future self…"
          placeholderTextColor={t.text3}
          multiline
          autoFocus
          style={[styles.input, { color: t.text, backgroundColor: t.surface, borderColor: t.border }]}
        />
        <ThemedText variant="mono" tone="faint" style={{ marginTop: 16, marginBottom: 8, letterSpacing: 1 }}>SEAL UNTIL</ThemedText>
        <View style={styles.chips}>
          {PERIODS.map((p) => (
            <Chip key={p.label} label={p.label} active={period.label === p.label} onPress={() => setPeriod(p)} />
          ))}
        </View>
        <Button label="Seal capsule" full style={{ marginTop: 18 }} onPress={seal} disabled={!content.trim()} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 16, padding: 16, minHeight: 120, fontSize: 16, lineHeight: 24, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
