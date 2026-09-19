import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';
import { Icon, type IconName } from './Icon';
import { ThemedText } from './Text';
import { springs, Haptics } from '../motion/motion';

const TAB_ICONS: Record<string, IconName> = {
  index: 'home',
  explore: 'compass',
  create: 'plus',
  journal: 'book',
  you: 'user',
};
const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  explore: 'Explore',
  create: 'Create',
  journal: 'Journal',
  you: 'You',
};

type TabBarNavState = {
  index: number;
  routes: { key: string; name: string }[];
};
type TabBarNav = {
  emit: (e: { type: 'tabPress'; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean };
  navigate: (name: string) => void;
};

export function TabBar({ state, navigation }: { state: TabBarNavState; navigation: TabBarNav }) {
  const t = useTheme();
  const { reduceMotion } = useThemeControls();
  const insets = useSafeAreaInsets();
  const routes = state.routes.filter((r) => TAB_ICONS[r.name]);
  const count = routes.length;

  // Midnight: sliding filled circle behind active tab.
  const indicator = useSharedValue(0);
  const activeIndex = routes.findIndex((r) => state.index === state.routes.indexOf(r));
  useEffect(() => {
    if (reduceMotion) indicator.value = activeIndex;
    else indicator.value = withSpring(activeIndex, springs.snappy);
  }, [activeIndex, reduceMotion, indicator]);

  const barContent = (
    <View style={styles.row}>
      {routes.map((route, i) => {
        const focused = state.index === state.routes.indexOf(route);
        const isCreate = route.name === 'create';
        return (
          <TabItem
            key={route.key}
            name={route.name}
            focused={focused}
            isCreate={isCreate}
            onPress={() => {
              Haptics.light();
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
          />
        );
      })}
      {t.id === 'midnight' && <MidnightIndicator indicator={indicator} count={count} />}
    </View>
  );

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]} pointerEvents="box-none">
      <View
        style={[
          styles.bar,
          {
            backgroundColor: t.navBar,
            borderColor: t.navBorder,
            borderRadius: t.rPill,
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 },
          },
        ]}
      >
        {barContent}
      </View>
    </View>
  );
}

function MidnightIndicator({ indicator, count }: { indicator: SharedValue<number>; count: number }) {
  const t = useTheme();
  const aStyle = useAnimatedStyle(() => {
    const slot = 1 / count;
    return {
      left: `${(indicator.value * slot) * 100}%`,
      width: `${slot * 100}%`,
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[styles.mnIndicatorWrap, aStyle]}>
      <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: t.navActive }} />
    </Animated.View>
  );
}

function TabItem({
  name, focused, isCreate, onPress,
}: {
  name: string; focused: boolean; isCreate: boolean; onPress: () => void;
}) {
  const t = useTheme();
  const { reduceMotion } = useThemeControls();
  const scale = useSharedValue(1);
  const dot = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) { dot.value = focused ? 1 : 0; return; }
    dot.value = withSpring(focused ? 1 : 0, springs.pop);
  }, [focused, reduceMotion, dot]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const dotStyle = useAnimatedStyle(() => ({ opacity: dot.value, transform: [{ scale: dot.value }] }));

  // Ember + Paper: active icon in navActive color with a dot below.
  // Midnight: active icon dark (sits on filled circle drawn by indicator).
  const isMidnight = t.id === 'midnight';
  const iconColor = focused
    ? (isMidnight ? t.navActiveText : t.navActive)
    : t.navInactive;

  if (isCreate) {
    return (
      <Pressable onPress={onPress} onPressIn={() => { if (!reduceMotion) scale.value = withSpring(0.86, springs.snappy); }} onPressOut={() => { if (!reduceMotion) scale.value = withSpring(1, springs.pop); }} style={styles.item} accessibilityRole="button" accessibilityLabel="Create a flare">
        <Animated.View style={[styles.createBtn, { backgroundColor: t.accentStrong }, iconStyle]}>
          <Icon name="plus" size={24} color={t.onAccent} strokeWidth={2.4} />
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { if (!reduceMotion) scale.value = withSpring(0.86, springs.snappy); }}
      onPressOut={() => { if (!reduceMotion) scale.value = withSpring(1, springs.pop); }}
      style={styles.item}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={TAB_LABELS[name]}
    >
      <Animated.View style={[{ alignItems: 'center' }, iconStyle]}>
        <Icon name={TAB_ICONS[name]} size={23} color={iconColor} strokeWidth={focused ? 2.2 : 1.9} />
        {!isMidnight && (
          <Animated.View style={[{ width: 5, height: 5, borderRadius: 3, backgroundColor: t.navActive, marginTop: 4 }, dotStyle]} />
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1,
    width: '92%', maxWidth: 460,
  },
  row: { flexDirection: 'row', alignItems: 'center', flex: 1, position: 'relative' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 52, zIndex: 2 },
  createBtn: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  mnIndicatorWrap: { position: 'absolute', top: 3, bottom: 3, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
});
