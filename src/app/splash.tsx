import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { layout, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { IdentityStorageUnavailableError, loadIdentity } from '@/lib/identity';
import { useAppState } from '@/state/app-state';

export default function Splash() {
  const colors = useColors();
  const { setIdentity, contactsLoaded } = useAppState();
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    if (!contactsLoaded) return;

    loadIdentity()
      .then((identity) => {
        if (!identity) {
          router.replace('/create-identity');
          return;
        }
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
  }, [contactsLoaded, setIdentity]);

  return (
    <View style={[styles.container, { backgroundColor: colors.paper }]}>
      <Text style={[styles.wordmark, { color: colors.ink }]}>Svoboda.</Text>
      {unsupported && (
        <Text style={[styles.notice, { color: colors.muted }]}>
          Svoboda keeps your private key in your phone’s keychain. Open it on iOS or Android.
        </Text>
      )}
      <Text style={[styles.footer, { color: colors.muted }]}>
        Post-quantum · v{Constants.expoConfig?.version}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: typography.wordmark,
  notice: {
    ...typography.body,
    maxWidth: 320,
    marginTop: spacing[4],
    paddingHorizontal: layout.margin,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing[12],
    textAlign: 'center',
    ...typography.caption,
  },
});
