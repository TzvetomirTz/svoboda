import Constants from 'expo-constants';
import type { ReactNode } from 'react';
import { Image, Platform, StyleSheet, useColorScheme, View } from 'react-native';

import { Text } from '@/components/text';
import { layout, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';

// The launch screen's own image at its own size (app.json, expo-splash-screen `imageWidth`), so
// handing over between it and these screens changes nothing. Text would never match it exactly.
const LAUNCH_IMAGE = { light: require('../../assets/images/splash-icon.png'), dark: require('../../assets/images/splash-icon-dark.png') };
const LAUNCH_IMAGE_WIDTH = Platform.OS === 'android' ? 180 : 225;
const LAUNCH_IMAGE_ASPECT = 2448 / 456;

/**
 * The splash: the wordmark where the native launch screen draws it, and the version footer.
 * Shared by the splash and lock screens so moving between them leaves the wordmark in place.
 * `notice` sits under the wordmark and `children` are laid out over the whole screen, neither
 * moving the wordmark. The version footer is off unless asked for: the native launch screen has
 * none, so showing it while the splash just passes through would make it flash.
 */
export function SplashBackdrop({
  notice,
  showVersion = false,
  onWordmarkLoad,
  children,
}: {
  notice?: ReactNode;
  showVersion?: boolean;
  /** Called once the wordmark has drawn, or failed to. */
  onWordmarkLoad?: () => void;
  children?: ReactNode;
}) {
  const colors = useColors();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return (
    <View style={[styles.container, { backgroundColor: colors.paper }]}>
      <Image
        source={LAUNCH_IMAGE[scheme]}
        style={styles.wordmark}
        // Android fades images in by default.
        fadeDuration={0}
        onLoadEnd={onWordmarkLoad}
        accessible
        accessibilityRole="image"
        accessibilityLabel="Svoboda"
      />
      {notice && <View style={styles.notice}>{notice}</View>}
      {showVersion && (
        <Text style={[styles.footer, { color: colors.muted }]}>Post-quantum · v{Constants.expoConfig?.version}</Text>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    width: LAUNCH_IMAGE_WIDTH,
    height: LAUNCH_IMAGE_WIDTH / LAUNCH_IMAGE_ASPECT,
  },
  notice: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    marginTop: LAUNCH_IMAGE_WIDTH / LAUNCH_IMAGE_ASPECT / 2 + spacing[4],
    paddingHorizontal: layout.margin,
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

/** Bottom of a button or link placed just above the footer. */
export const ABOVE_FOOTER = spacing[12] + typography.caption.lineHeight + spacing[4];
