import '@/lib/polyfills';

import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono/400Regular';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { excludeAppDataFromBackup } from '@/lib/backup';
import { protectScreen } from '@/lib/screen-privacy';
import { applyTheme, loadTheme } from '@/lib/theme';
import { AppLockProvider } from '@/state/app-lock';
import { AppStateProvider } from '@/state/app-state';

// Keep the native launch screen up until fonts load and the splash route has drawn the same
// wordmark image in the same place; it hides the launch screen itself.
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 200 });

// Before the first render, so no screen draws in the wrong theme first.
applyTheme(loadTheme());
protectScreen();
excludeAppDataFromBackup();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    IBMPlexMono_400Regular,
  });

  // In case the app opens on another route, such as from a link, the splash never gets to.
  useEffect(() => {
    if (!fontsLoaded) return;
    const timeout = setTimeout(() => SplashScreen.hide(), 1000);
    return () => clearTimeout(timeout);
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="auto" />
      <AppStateProvider>
        <AppLockProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ animation: 'none' }} />
            <Stack.Screen name="splash" options={{ animation: 'none' }} />
            <Stack.Screen name="create-identity" options={{ animation: 'fade' }} />
            <Stack.Screen name="(main)" options={{ animation: 'fade' }} />
            <Stack.Screen name="contacts" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="keyboard-languages" />
            <Stack.Screen name="connect" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="name-contact" options={{ presentation: 'fullScreenModal' }} />
            {/* Over everything, modals included, so whatever was open is still there once unlocked. */}
            <Stack.Screen name="lock" options={{ presentation: 'fullScreenModal', animation: 'none', gestureEnabled: false }} />
          </Stack>
        </AppLockProvider>
      </AppStateProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
