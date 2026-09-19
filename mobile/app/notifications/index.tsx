import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../src/ui/Screen';
import { ThemedText } from '../../src/ui/Text';
import { IconButton } from '../../src/ui/Pressables';
import { Icon } from '../../src/ui/Icon';
import { Card } from '../../src/ui/Surface';
import { Companion } from '../../src/features/Companion';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useStore } from '../../src/state/store';
import { timeAgo } from '../../src/lib/format';

export default function Notifications() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, markNotificationsRead, dismissNotification } = useStore();

  useEffect(() => { markNotificationsRead(); }, [markNotificationsRead]);

  const items = state.notifications;
  const today = items.filter((n) => Date.now() - n.createdAt < 86400000);
  const older = items.filter((n) => Date.now() - n.createdAt >= 86400000);

  return (
    <ScreenBackground>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 16 }}>
        <View style={styles.head}>
          <IconButton label="Back" onPress={() => router.back()} size={40} variant="surface">
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <Icon name="chevron" size={20} color={t.text} />
            </View>
          </IconButton>
          <ThemedText variant="title">Notifications</ThemedText>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Companion id="dusk" state="sleep" size={110} />
          <ThemedText variant="heading" style={{ marginTop: 18, textAlign: 'center' }}>Nothing new, and that's fine</ThemedText>
          <ThemedText variant="body" tone="muted" style={{ textAlign: 'center', marginTop: 6 }}>
            Real replies, helpful marks, and opened capsules will show up here — never manufactured activity.
          </ThemedText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
          {today.length > 0 && <ThemedText variant="mono" tone="faint" style={styles.group}>TODAY</ThemedText>}
          {today.map((n) => (
            <Card key={n.id} style={styles.item}>
              <View style={{ flex: 1 }}>
                <ThemedText variant="label">{n.title}</ThemedText>
                <ThemedText variant="meta" tone="muted">{n.body} · {timeAgo(n.createdAt)}</ThemedText>
              </View>
              <IconButton label="Dismiss" onPress={() => dismissNotification(n.id)} size={36} variant="surface">
                <Icon name="x" size={16} color={t.text2} />
              </IconButton>
            </Card>
          ))}
          {older.length > 0 && <ThemedText variant="mono" tone="faint" style={styles.group}>OLDER</ThemedText>}
          {older.map((n) => (
            <Card key={n.id} style={styles.item}>
              <View style={{ flex: 1 }}>
                <ThemedText variant="label">{n.title}</ThemedText>
                <ThemedText variant="meta" tone="muted">{n.body} · {timeAgo(n.createdAt)}</ThemedText>
              </View>
              <IconButton label="Dismiss" onPress={() => dismissNotification(n.id)} size={36} variant="surface">
                <Icon name="x" size={16} color={t.text2} />
              </IconButton>
            </Card>
          ))}
        </ScrollView>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  group: { marginTop: 12, marginBottom: 8, letterSpacing: 1 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
});
