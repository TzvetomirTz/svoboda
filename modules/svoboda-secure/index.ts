import * as Clipboard from 'expo-clipboard';
import { requireNativeView, requireOptionalNativeModule } from 'expo';
import type { ComponentType } from 'react';
import { View, type ViewProps } from 'react-native';

// Svoboda's native privacy hardening. Needs a development or release build; in Expo Go, on the web
// and in tests the native module is missing and everything falls back to plain behaviour.
// None of it protects against a compromised phone: the OS still draws the screen and delivers the
// touches.

type SvobodaSecureModule = {
  setSensitiveString(text: string, expiresInSeconds: number): Promise<void>;
  filterObscuredTouches(): Promise<void>;
  enableBackgroundCover(): Promise<void>;
};

const native = requireOptionalNativeModule<SvobodaSecureModule>('SvobodaSecure');

/** How long a copied message stays on the iOS clipboard. */
export const CLIPBOARD_EXPIRY_SECONDS = 5 * 60;

/**
 * Copies text marked as sensitive: Android 13+ hides it from the clipboard preview; iOS keeps it
 * on this device (no Universal Clipboard) and clears it after five minutes.
 */
export async function setSensitiveClipboardString(text: string): Promise<void> {
  if (native) await native.setSensitiveString(text, CLIPBOARD_EXPIRY_SECONDS);
  else await Clipboard.setStringAsync(text);
}

/** Android: drop touches that arrive while another app's window covers ours. */
export async function filterObscuredTouches(): Promise<void> {
  await native?.filterObscuredTouches();
}

/** iOS: show the launch screen over the app whenever it isn't active, for the app switcher. */
export async function enableBackgroundCover(): Promise<void> {
  await native?.enableBackgroundCover();
}

/**
 * Container for the message box and the Svoboda keyboard. Android: accessibility-data-sensitive
 * (14+), ignores obscured touches, and asks the system keyboard not to learn from what is typed
 * inside. Elsewhere a plain View.
 */
export const SecureInputView: ComponentType<ViewProps> = native
  ? requireNativeView<ViewProps>('SvobodaSecure')
  : View;
