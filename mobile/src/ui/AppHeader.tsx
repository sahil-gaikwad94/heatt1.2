import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolation, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/ThemeProvider';
import { ThemedText } from './Text';
import { IconButton } from './Pressables';
import { Icon } from './Icon';
import { Avatar } from './Avatar';
import { useStore } from '../state/store';

const HEADER_H = 52;

export function AppHeader({
  scrollY,
  onSearch,
}: {
  scrollY?: SharedValue<number>;
  onSearch?: () => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, authorFor } = useStore();
  const user = authorFor('user');
  const unread = state.notifications.filter((n) => !n.read).length;

  const aStyle = useAnimatedStyle(() => {
    if (!scrollY) return { opacity: 1, transform: [{ translateY: 0 }] };
    const ty = interpolate(scrollY.value, [0, 80], [0, -8], Extrapolation.CLAMP);
    const op = interpolate(scrollY.value, [0, 60], [1, 0.96], Extrapolation.CLAMP);
    return { opacity: op, transform: [{ translateY: ty }] };
  });

  return (
    <Animated.View style={[styles.wrap, { paddingTop: insets.top + 6, backgroundColor: t.id === 'ember' ? 'transparent' : t.bg }, aStyle]}>
      <View style={styles.row}>
        <View style={styles.brand}>
          <View style={[styles.mark, { backgroundColor: t.accentStrong }]}>
            <Icon name="fire" size={16} color={t.onAccent} />
          </View>
          <ThemedText variant="heading" serif style={{ fontSize: 22 }}>heatt</ThemedText>
        </View>
        <View style={styles.actions}>
          <IconButton label="Search" onPress={onSearch ?? (() => router.push('/explore'))} variant={t.id === 'ember' ? 'glass' : 'ghost'} size={40}>
            <Icon name="search" size={20} color={t.text} />
          </IconButton>
          <IconButton label={`Notifications${unread ? `, ${unread} unread` : ''}`} onPress={() => router.push('/notifications')} variant={t.id === 'ember' ? 'glass' : 'ghost'} size={40}>
            <View>
              <Icon name="bell" size={20} color={t.text} />
              {unread > 0 && !state.preferences.quietMode && <View style={[styles.dot, { backgroundColor: t.accentStrong, borderColor: t.bg }]} />}
            </View>
          </IconButton>
          <IconButton label="Your profile" onPress={() => router.push('/you')} size={40}>
            <Avatar initials={user.initials} accent="user" size={34} avatarData={(user as any).avatarData} />
          </IconButton>
        </View>
      </View>
    </Animated.View>
  );
}

export const HEADER_HEIGHT = HEADER_H;

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: HEADER_H },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  dot: { position: 'absolute', top: -2, right: -2, width: 9, height: 9, borderRadius: 5, borderWidth: 1.5 },
});
