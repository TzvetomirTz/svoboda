import * as ScreenCapture from 'expo-screen-capture';

import { enableBackgroundCover, filterObscuredTouches } from '../../modules/svoboda-secure';

/**
 * Keeps messages and keys out of screenshots, recordings, screen sharing and the app switcher.
 * Android: screenshots are refused (FLAG_SECURE) and the recents preview is blank. iOS: captures
 * show the app blank, the window is covered while the screen is recorded or mirrored, and the
 * launch screen covers the app whenever it isn't in front. Left off in development so the app can
 * still be captured for docs and bug reports.
 *
 * Android also drops touches while another app's window covers ours (tapjacking), in development too.
 */
export async function protectScreen() {
  try {
    await filterObscuredTouches();
  } catch (error) {
    console.error('Could not turn on touch filtering', error);
  }
  if (__DEV__) return;
  try {
    await enableBackgroundCover();
    if (!(await ScreenCapture.isAvailableAsync())) return;
    await ScreenCapture.preventScreenCaptureAsync();
  } catch (error) {
    console.error('Could not turn on screen capture protection', error);
  }
}
