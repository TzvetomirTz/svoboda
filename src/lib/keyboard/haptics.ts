import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// A light tap when a key goes down. Both platforms skip it when system haptics or touch feedback
// are turned off: iOS feedback generators respect the System Haptics setting, and Android's
// keyboard-tap haptic goes through View.performHapticFeedback, which respects Touch feedback.
// No sound, ever.
export function keyHaptic() {
  const result =
    Platform.OS === 'android'
      ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Keyboard_Tap)
      : Platform.OS === 'ios'
        ? Haptics.selectionAsync()
        : null;
  result?.catch(() => {});
}
