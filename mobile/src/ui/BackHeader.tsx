import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { ThemedText } from './Text';
import { IconButton } from './Pressables';
import { Icon } from './Icon';

export function BackHeader({ title, right }: { title?: string; right?: React.ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6, backgroundColor: t.id === 'ember' ? 'transparent' : t.bg }]}>
      <IconButton label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} size={40} variant={t.id === 'ember' ? 'glass' : 'surface'}>
        <View style={{ transform: [{ rotate: '180deg' }] }}>
          <Icon name="chevron" size={20} color={t.text} />
        </View>
      </IconButton>
      {title ? <ThemedText variant="heading" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>{title}</ThemedText> : <View style={{ flex: 1 }} />}
      <View style={{ minWidth: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 8, gap: 8 },
});
