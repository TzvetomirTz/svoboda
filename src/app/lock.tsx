import { useEffect, useState } from 'react';
import { AppState, BackHandler, StyleSheet } from 'react-native';

import { Button } from '@/components/button';
import { ABOVE_FOOTER, SplashBackdrop } from '@/components/splash-backdrop';
import { Text } from '@/components/text';
import { layout, typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useAppLock } from '@/state/app-lock';

const messages: Partial<Record<string, string>> = {
  lockout: 'Too many attempts. Unlock your phone with its passcode, then try again.',
  authentication_failed: 'That didn’t match. Try again.',
};

/** Cancelling isn't an error: the Unlock button is there to try again. */
function shownError(reason: string | null) {
  return reason === null || reason === 'user_cancel' || reason === 'system_cancel' || reason === 'app_cancel' ? null : reason;
}

export default function Lock() {
  const colors = useColors();
  const { unlock } = useAppLock();
  const [error, setError] = useState<string | null>(null);
  // While the prompt is up the lock screen looks just like the splash, so opening the app shows
  // no button that vanishes again once unlocked. It appears only if the prompt didn't unlock.
  const [asking, setAsking] = useState(true);

  function settle(reason: string | null) {
    if (reason === null) return;
    setError(shownError(reason));
    setAsking(false);
  }

  // Ask as soon as the lock screen is in front, and again each time the app comes back from the
  // background. iOS passes through 'inactive' both at launch and on the way back from the
  // background, so the prompt waits for 'active'. The Face ID sheet only makes the app 'inactive'
  // and Android's passcode screen sends it to the background while the prompt is up; neither
  // counts, so a cancelled prompt stays cancelled until Unlock is tapped.
  useEffect(() => {
    let pending = true;
    let prompting = false;

    function prompt() {
      pending = false;
      prompting = true;
      unlock().then((reason) => {
        prompting = false;
        settle(reason);
      });
    }

    if (AppState.currentState === 'active') prompt();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' && !prompting) pending = true;
      if (state === 'active' && pending) {
        setAsking(true);
        prompt();
      }
    });
    return () => subscription.remove();
    // Once: re-running would prompt again after a cancel whenever the provider re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function retry() {
    setAsking(true);
    unlock().then(settle);
  }

  // Android's back would otherwise close the lock screen.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  return (
    <SplashBackdrop
      showVersion={!asking}
      notice={
        !asking && (
          <Text style={[styles.notice, { color: error ? colors.alert : colors.muted }]} accessibilityLiveRegion="polite">
            {error ? (messages[error] ?? 'Could not unlock. Try again.') : 'Locked'}
          </Text>
        )
      }>
      {!asking && <Button label="Unlock" onPress={retry} style={styles.button} />}
    </SplashBackdrop>
  );
}

const styles = StyleSheet.create({
  notice: {
    ...typography.body,
    maxWidth: 320,
    textAlign: 'center',
  },
  button: {
    position: 'absolute',
    left: layout.margin,
    right: layout.margin,
    bottom: ABOVE_FOOTER,
  },
});
