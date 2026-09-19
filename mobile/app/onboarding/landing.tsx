import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../src/ui/Screen';
import { ThemedText } from '../../src/ui/Text';
import { Button } from '../../src/ui/Pressables';
import { Icon } from '../../src/ui/Icon';
import { HeatOrb } from '../../src/features/HeatOrb';
import { Companion } from '../../src/features/Companion';
import { MarqueeRow } from '../../src/ui/Marquee';
import { Chip } from '../../src/ui/Pressables';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useStore } from '../../src/state/store';
import { blogCategories } from '../../src/data/catalog';

export default function Landing() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setOnboarded } = useStore();

  const features = [
    { icon: 'fire' as const, title: 'Heat, not likes', body: 'One honest reaction per person, 1 to 3. Hold to intensify.' },
    { icon: 'book' as const, title: 'Read the open web', body: 'Real writers, real sources. Always linked to the original.' },
    { icon: 'lock' as const, title: 'A private journal', body: 'Keep lines that move you. Never shared, never ranked.' },
  ];

  return (
    <ScreenBackground>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <View style={styles.hero}>
          <Animated.View entering={FadeIn.duration(500)}>
            {t.id === 'ember' ? <HeatOrb size={180} /> : <Companion id={t.id === 'midnight' ? 'dusk' : 'ink'} size={140} />}
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(150).duration(500)} style={{ alignItems: 'center', marginTop: 8 }}>
            <ThemedText variant="display" serif style={{ textAlign: 'center', fontSize: 40, lineHeight: 44 }}>
              Where your mind{'\n'}catches fire
            </ThemedText>
            <ThemedText variant="read" tone="muted" style={{ textAlign: 'center', marginTop: 12, paddingHorizontal: 30 }}>
              A calmer social app for reading and writing worth your attention.
            </ThemedText>
          </Animated.View>
        </View>

        {/* drifting topics */}
        <View style={{ gap: 10, marginVertical: 8 }}>
          <MarqueeRow direction="left" speed={20}>
            {blogCategories.slice(0, 7).map((c) => <Chip key={c} label={c} variant="dashed" />)}
          </MarqueeRow>
          <MarqueeRow direction="right" speed={24}>
            {blogCategories.slice(6, 13).map((c) => <Chip key={c} label={c} variant="dashed" />)}
          </MarqueeRow>
        </View>

        <View style={styles.features}>
          {features.map((f, i) => (
            <Animated.View key={f.title} entering={FadeInDown.delay(250 + i * 100)} style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: t.id === 'ember' ? t.surfaceGlass : t.surface2 }]}>
                <Icon name={f.icon} size={18} color={t.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="label">{f.title}</ThemedText>
                <ThemedText variant="meta" tone="muted">{f.body}</ThemedText>
              </View>
            </Animated.View>
          ))}
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
          <Button label="Start your journey" full size="lg" iconRight={<Icon name="arrow" size={18} color={t.onAccent} />} onPress={() => router.push('/onboarding')} />
          <Button label="I’ll just look around" variant="ghost" full onPress={() => { setOnboarded(true); router.replace('/'); }} />
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 20 },
  features: { paddingHorizontal: 24, gap: 16, marginTop: 10, flex: 1, justifyContent: 'center' },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: 20, gap: 6 },
});
