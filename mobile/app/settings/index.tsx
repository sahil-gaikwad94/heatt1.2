import React from 'react';
import { View, ScrollView, Pressable, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../src/ui/Screen';
import { BackHeader } from '../../src/ui/BackHeader';
import { ThemedText } from '../../src/ui/Text';
import { Card } from '../../src/ui/Surface';
import { Icon } from '../../src/ui/Icon';
import { Button } from '../../src/ui/Pressables';
import { ThemePicker } from '../../src/features/ThemePicker';
import { useTheme, useThemeControls } from '../../src/theme/ThemeProvider';
import { useStore } from '../../src/state/store';
import { useToast } from '../../src/ui/Toast';
import { Haptics } from '../../src/motion/motion';

export default function Settings() {
  const t = useTheme();
  const { motionPref, setMotionPref } = useThemeControls();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { state, updatePreferences, signOut } = useStore();
  const prefs = state.preferences;

  const Row = ({ icon, title, subtitle, right, onPress }: { icon: any; title: string; subtitle?: string; right?: React.ReactNode; onPress?: () => void }) => (
    <Pressable onPress={onPress} style={styles.row} disabled={!onPress}>
      <View style={[styles.rowIcon, { backgroundColor: t.surface2 }]}>
        <Icon name={icon} size={18} color={t.text2} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText variant="label">{title}</ThemedText>
        {subtitle ? <ThemedText variant="meta" tone="faint">{subtitle}</ThemedText> : null}
      </View>
      {right}
    </Pressable>
  );

  const seg = (options: string[], value: string, onChange: (v: string) => void) => (
    <View style={[styles.segWrap, { backgroundColor: t.surface2 }]}>
      {options.map((o) => {
        const active = o === value;
        return (
          <Pressable key={o} onPress={() => { Haptics.tick(); onChange(o); }} style={[styles.segItem, active && { backgroundColor: t.text }]}>
            <ThemedText variant="meta" style={{ fontWeight: '700', color: active ? t.bg : t.text2 }}>{o}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <ScreenBackground>
      <BackHeader title="Settings" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 60 }}>
        {/* Atmosphere */}
        <ThemedText variant="mono" tone="faint" style={styles.section}>ATMOSPHERE</ThemedText>
        <ThemePicker />

        {/* Reading */}
        <ThemedText variant="mono" tone="faint" style={styles.section}>READING</ThemedText>
        <Card padded={false} style={styles.group}>
          <View style={styles.rowStatic}>
            <View style={[styles.rowIcon, { backgroundColor: t.surface2 }]}><ThemedText style={{ fontWeight: '800', fontSize: 13, color: t.text2 }}>Abc</ThemedText></View>
            <ThemedText variant="label" style={{ flex: 1 }}>Text size</ThemedText>
            {seg(['S', 'M', 'L'], prefs.textSize, (v) => updatePreferences({ textSize: v as any }))}
          </View>
          <View style={[styles.divider, { backgroundColor: t.border }]} />
          <View style={styles.rowStatic}>
            <View style={[styles.rowIcon, { backgroundColor: t.surface2 }]}><Icon name="book" size={18} color={t.text2} /></View>
            <ThemedText variant="label" style={{ flex: 1 }}>Reading font</ThemedText>
            {seg(['Serif', 'Sans', 'A11y'], prefs.readingFont === 'serif' ? 'Serif' : prefs.readingFont === 'sans' ? 'Sans' : 'A11y', (v) =>
              updatePreferences({ readingFont: v === 'Serif' ? 'serif' : v === 'Sans' ? 'sans' : 'hyperlegible' }))}
          </View>
        </Card>

        {/* Motion & feel */}
        <ThemedText variant="mono" tone="faint" style={styles.section}>MOTION & FEEL</ThemedText>
        <Card padded={false} style={styles.group}>
          <View style={styles.rowStatic}>
            <View style={[styles.rowIcon, { backgroundColor: t.surface2 }]}><Icon name="spark" size={18} color={t.text2} /></View>
            <ThemedText variant="label" style={{ flex: 1 }}>Motion</ThemedText>
            {seg(['System', 'Full', 'Reduced'], motionPref === 'system' ? 'System' : motionPref === 'full' ? 'Full' : 'Reduced', (v) =>
              setMotionPref(v === 'System' ? 'system' : v === 'Full' ? 'full' : 'reduced'))}
          </View>
          <View style={[styles.divider, { backgroundColor: t.border }]} />
          <Row icon="message" title="Haptics" subtitle="Tiny pulses on Android" right={
            <Switch value={prefs.haptics} onValueChange={(v) => { updatePreferences({ haptics: v }); Haptics.setEnabled(v); }} trackColor={{ true: t.accentStrong }} thumbColor="#fff" />
          } />
          <View style={[styles.divider, { backgroundColor: t.border }]} />
          <Row icon="moon" title="Quiet mode" subtitle="Silences the bell dot and companion prompts" right={
            <Switch value={prefs.quietMode} onValueChange={(v) => updatePreferences({ quietMode: v })} trackColor={{ true: t.accentStrong }} thumbColor="#fff" />
          } />
        </Card>

        {/* Your data */}
        <ThemedText variant="mono" tone="faint" style={styles.section}>YOUR DATA</ThemedText>
        <Card padded={false} style={styles.group}>
          <Row icon="lock" title="Privacy" subtitle="What Heatt stores, and where" onPress={() => toast.show({ message: 'Everything lives on your device until you sign in.' })} right={<Icon name="chevron" size={16} color={t.text3} />} />
          <View style={[styles.divider, { backgroundColor: t.border }]} />
          <Row icon="share" title="Export local data" onPress={() => toast.show({ message: 'Export prepared (demo).' })} right={<Icon name="chevron" size={16} color={t.text3} />} />
          <View style={[styles.divider, { backgroundColor: t.border }]} />
          <Row icon="trash" title="Delete local data" subtitle="Clears everything on this device" onPress={() => toast.show({ message: 'Hold to confirm in a real build.' })} right={<Icon name="chevron" size={16} color={t.text3} />} />
        </Card>

        {/* Account */}
        <ThemedText variant="mono" tone="faint" style={styles.section}>ACCOUNT</ThemedText>
        <Card padded={false} style={styles.group}>
          <Row icon="user" title={state.signedIn ? 'Signed in on this device' : 'Not signed in'} subtitle={state.signedIn ? state.profile.name : 'Your profile is local-only'} />
        </Card>
        <Button
          label={state.signedIn ? 'Log out' : 'Sign in'}
          variant="outline"
          full
          icon={<Icon name={state.signedIn ? 'logout' : 'user'} size={16} color={t.text} />}
          style={{ marginTop: 14 }}
          onPress={() => {
            if (state.signedIn) { signOut(); toast.show({ message: 'Logged out. Your local data stays on device.' }); }
            else { toast.show({ message: 'Sign-in connects Supabase in a full build.' }); }
          }}
        />

        <ThemedText variant="meta" tone="faint" style={{ textAlign: 'center', marginTop: 24 }}>Heatt · where your mind catches fire</ThemedText>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 22, marginBottom: 10, letterSpacing: 1 },
  group: { overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowStatic: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 60 },
  segWrap: { flexDirection: 'row', borderRadius: 999, padding: 3, gap: 2 },
  segItem: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, minWidth: 36, alignItems: 'center' },
});
