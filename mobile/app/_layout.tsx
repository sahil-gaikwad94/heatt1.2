import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme, useThemeControls } from '../src/theme/ThemeProvider';
import { StoreProvider, useStore } from '../src/state/store';
import { ToastProvider } from '../src/ui/Toast';

function Gate() {
  const t = useTheme();
  const { ready: themeReady } = useThemeControls();
  const { state, ready: storeReady } = useStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!themeReady || !storeReady) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!state.onboarded && !inOnboarding) {
      router.replace('/onboarding/landing');
    }
  }, [themeReady, storeReady, state.onboarded, segments, router]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg }, animation: 'fade' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding/landing" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding/index" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="flare/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="read/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="rooms/index" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="rooms/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="notifications/index" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings/index" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <StoreProvider>
            <ToastProvider>
              <Gate />
            </ToastProvider>
          </StoreProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
