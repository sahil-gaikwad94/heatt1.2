import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../src/ui/Screen';
import { ThemedText } from '../../src/ui/Text';
import { Button, Chip, IconButton } from '../../src/ui/Pressables';
import { Icon } from '../../src/ui/Icon';
import { Card } from '../../src/ui/Surface';
import { MarqueeRow } from '../../src/ui/Marquee';
import { ThemePicker } from '../../src/features/ThemePicker';
import { Companion } from '../../src/features/Companion';
import { HeatOrb } from '../../src/features/HeatOrb';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useStore } from '../../src/state/store';
import { blogCategories } from '../../src/data/catalog';

const INTENTS = ['Reflect', 'Learn', 'Connect', 'Explore'] as const;
const STEPS = 4;

export default function Onboarding() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setOnboarded, updatePreferences, state } = useStore();
  const [step, setStep] = useState(0);
  const [topics, setTopics] = useState<string[]>(state.preferences.topics);
  const [intent, setIntent] = useState<(typeof INTENTS)[number]>('Explore');

  const rows = [blogCategories.slice(0, 5), blogCategories.slice(5, 9), blogCategories.slice(9, 13)];

  const toggle = (c: string) => setTopics((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

  const finish = () => {
    updatePreferences({ topics: topics.length ? topics : blogCategories.slice(0, 4), intent });
    setOnboarded(true);
    router.replace('/');
  };

  const next = () => (step < STEPS - 1 ? setStep(step + 1) : finish());

  return (
    <ScreenBackground>
      <View style={{ flex: 1, paddingTop: insets.top + 8 }}>
        {/* progress + skip */}
        <View style={styles.top}>
          <View style={styles.progress}>
            {Array.from({ length: STEPS }).map((_, i) => (
              <View key={i} style={[styles.seg, { backgroundColor: i <= step ? t.accent : t.border }]} />
            ))}
          </View>
          <IconButton label="Skip" onPress={finish} size={36} variant="surface">
            <Icon name="x" size={16} color={t.text2} />
          </IconButton>
        </View>

        {step === 0 && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.body}>
            <View style={{ paddingHorizontal: 24 }}>
              <ThemedText variant="display" serif>What would you like to make room for?</ThemedText>
              <ThemedText variant="body" tone="muted" style={{ marginTop: 8 }}>Pick a few. You can change these anytime.</ThemedText>
            </View>
            <View style={{ marginTop: 30, gap: 12 }}>
              {rows.map((row, ri) => (
                <MarqueeRow key={ri} direction={ri % 2 === 0 ? 'left' : 'right'} speed={22 + ri * 6}>
                  {row.map((c) => (
                    <Chip key={c} label={c} active={topics.includes(c)} onPress={() => toggle(c)} variant="dashed" />
                  ))}
                </MarqueeRow>
              ))}
            </View>
            <ThemedText variant="meta" tone="faint" style={{ textAlign: 'center', marginTop: 24 }}>
              {topics.length} selected
            </ThemedText>
          </Animated.View>
        )}

        {step === 1 && (
          <Animated.View entering={SlideInRight} exiting={FadeOut} style={styles.body}>
            <View style={{ paddingHorizontal: 24 }}>
              <ThemedText variant="display" serif>Why are you here today?</ThemedText>
              <ThemedText variant="body" tone="muted" style={{ marginTop: 8 }}>This shapes your feed — gently, and correctably.</ThemedText>
            </View>
            <View style={{ paddingHorizontal: 20, marginTop: 24, gap: 12 }}>
              {INTENTS.map((iv) => (
                <Pressable key={iv} onPress={() => setIntent(iv)}>
                  <Card style={[styles.intentCard, intent === iv && { borderColor: t.accent, borderWidth: 2 }]} glass={t.id === 'ember'}>
                    <ThemedText variant="heading">{iv}</ThemedText>
                    <ThemedText variant="meta" tone="muted">
                      {iv === 'Reflect' ? 'Space to sit with an idea.' : iv === 'Learn' ? 'Useful things I can apply.' : iv === 'Connect' ? 'People thinking out loud.' : 'Wander somewhere new.'}
                    </ThemedText>
                    {intent === iv && <View style={styles.intentCheck}><Icon name="check" size={16} color={t.accent} /></View>}
                  </Card>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View entering={SlideInRight} exiting={FadeOut} style={styles.body}>
            <View style={{ paddingHorizontal: 24 }}>
              <ThemedText variant="display" serif>Pick your atmosphere</ThemedText>
              <ThemedText variant="body" tone="muted" style={{ marginTop: 8 }}>Tap to feel each one — the whole app changes live.</ThemedText>
            </View>
            <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
              <ThemePicker />
            </View>
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View entering={SlideInRight} exiting={FadeOut} style={[styles.body, { alignItems: 'center', justifyContent: 'center' }]}>
            {t.id === 'ember' ? <HeatOrb size={160} /> : <Companion id={t.id === 'midnight' ? 'dusk' : 'ink'} size={130} onBoop={() => {}} />}
            <View style={{ paddingHorizontal: 30, alignItems: 'center', marginTop: 20 }}>
              <ThemedText variant="display" serif style={{ textAlign: 'center' }}>Meet {t.companion}</ThemedText>
              <ThemedText variant="body" tone="muted" style={{ textAlign: 'center', marginTop: 8 }}>
                Your companion hosts this atmosphere. It never posts, never nags — it just helps you find good reading.
              </ThemedText>
            </View>
          </Animated.View>
        )}

        {/* footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Button
            label={step === STEPS - 1 ? 'Enter Heatt' : 'Continue'}
            full
            size="lg"
            iconRight={<Icon name="arrow" size={18} color={t.onAccent} />}
            onPress={next}
          />
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, marginBottom: 8 },
  progress: { flex: 1, flexDirection: 'row', gap: 6 },
  seg: { flex: 1, height: 5, borderRadius: 3 },
  body: { flex: 1, paddingTop: 30 },
  intentCard: { paddingVertical: 18 },
  intentCheck: { position: 'absolute', top: 16, right: 16 },
  footer: { paddingHorizontal: 20, paddingTop: 10 },
});
