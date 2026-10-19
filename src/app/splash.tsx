import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { SplashBackdrop } from '@/components/splash-backdrop';
import { Text } from '@/components/text';
import { typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { IdentityStorageUnavailableError, loadIdentity } from '@/lib/identity';
import { useAppLock } from '@/state/app-lock';
import { useAppState } from '@/state/app-state';

export default function Splash() {
  const colors = useColors();
  const { setIdentity, contactsLoaded } = useAppState();
  const { lock } = useAppLock();
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    if (!contactsLoaded) return;

    loadIdentity()
      .then(async (identity) => {
        if (!identity) {
          router.replace('/create-identity');
          return;
        }
        await lock();
        setIdentity(identity);
        router.replace('/send');
      })
      .catch((error) => {
        if (error instanceof IdentityStorageUnavailableError) {
          setUnsupported(true);
          return;
        }
        // Never send the user to create a new identity when the existing one just failed to load.
        console.error('Could not load identity', error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, when contacts have loaded
  }, [contactsLoaded, setIdentity]);

  return (
    <SplashBackdrop
      showVersion={unsupported}
      // The launch screen stays up until the same wordmark is drawn here, so it never blinks out.
      onWordmarkLoad={() => SplashScreen.hide()}
      notice={
        unsupported && (
          <Text style={[styles.notice, { color: colors.muted }]}>
            Svoboda keeps your private key in your phone’s keychain. Open it on iOS or Android.
          </Text>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  notice: {
    ...typography.body,
    maxWidth: 320,
    textAlign: 'center',
  },
});
