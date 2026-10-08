import * as ScreenCapture from 'expo-screen-capture';
import { Platform } from 'react-native';

/**
 * Keeps messages and keys out of screenshots, recordings, screen sharing and the app switcher.
 * Android: screenshots are refused and the recents preview is blank. iOS: captures show the app
 * blank, and it blurs whenever it isn't in front. Left off in development so the app can still be
 * captured for docs and bug reports.
 */
export async function protectScreen() {
  if (__DEV__) return;
  try {
    if (!(await ScreenCapture.isAvailableAsync())) return;
    await ScreenCapture.preventScreenCaptureAsync();
    if (Platform.OS === 'ios') await ScreenCapture.enableAppSwitcherProtectionAsync(1);
  } catch (error) {
    console.error('Could not turn on screen capture protection', error);
  }
}
