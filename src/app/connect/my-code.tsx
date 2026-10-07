import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { QrCode } from '@/components/qr-code';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { NavBar } from '@/components/top-bar';
import { fonts, layout, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { encodeContactCard, splitIntoFrames } from '@/lib/contact-card';
import { formatFingerprint } from '@/lib/fingerprint';
import { useAppState } from '@/state/app-state';

const FRAME_INTERVAL_MS = 250;
const QR_PADDING = 22;
const QR_MAX = 300;

export default function MyCode() {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const { identity } = useAppState();
  const [frame, setFrame] = useState(0);

  const frames = useMemo(
    () =>
      identity
        ? splitIntoFrames(
            encodeContactCard({
              name: identity.name,
              encryptionKey: identity.encryption.publicKey,
              signingKey: identity.signing.publicKey,
            }),
          )
        : [],
    [identity],
  );

  // Both public keys don't fit in one code, so the code loops through several.
  useEffect(() => {
    if (frames.length < 2) return;
    const timer = setInterval(() => setFrame((f) => (f + 1) % frames.length), FRAME_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [frames.length]);

  if (!identity) return null;

  const qrSize = Math.min(QR_MAX, width - 2 * layout.margin - 2 * QR_PADDING - 2 * layout.rule);
  const [line1, line2] = [formatFingerprint(identity.fingerprint).slice(0, 19), formatFingerprint(identity.fingerprint).slice(20)];

  return (
    <Screen>
      <NavBar kind="close" label="Contacts" />

      <View
        style={[styles.codeBox, { borderColor: colors.ink, backgroundColor: colors.paper }]}
        accessible
        accessibilityRole="image"
        accessibilityLabel="Your Svoboda contact code">
        <QrCode value={frames[frame % frames.length]} size={qrSize} color={colors.ink} />
      </View>

      <View style={styles.identity}>
        <View style={styles.name}>
          <Text style={[typography.label, { color: colors.muted }]}>Your identity</Text>
          <Text style={[styles.nameText, { color: colors.ink }]} numberOfLines={1}>
            {identity.name}
          </Text>
        </View>
        <Text style={[styles.fingerprint, { color: colors.ink }]} accessibilityLabel={`Fingerprint ${line1} ${line2}`}>
          {line1}
          {'\n'}
          {line2}
        </Text>
      </View>

      <Text style={[styles.note, { color: colors.muted, borderTopColor: colors.line }]}>
        Let the other person scan this. It contains only your public key, so it is safe to show.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeBox: {
    marginTop: 24,
    marginHorizontal: layout.margin,
    padding: QR_PADDING,
    borderWidth: layout.rule,
    alignItems: 'center',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: layout.margin,
    paddingHorizontal: layout.margin,
  },
  name: {
    flexShrink: 1,
    gap: spacing[1],
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.72,
  },
  fingerprint: {
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'right',
  },
  note: {
    marginTop: spacing[4],
    marginHorizontal: layout.margin,
    paddingTop: spacing[4],
    borderTopWidth: layout.hairline,
    fontSize: 14,
    lineHeight: 21,
  },
});
