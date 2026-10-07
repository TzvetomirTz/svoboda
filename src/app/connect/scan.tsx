import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useFocusEffect, useIsFocused } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { NavBar } from '@/components/top-bar';
import { fonts, layout, spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { decodeContactCard, FrameAssembler, InvalidContactCardError } from '@/lib/contact-card';
import { bytesToHex } from '@/lib/encoding';
import { fingerprint } from '@/lib/fingerprint';
import { useAppState } from '@/state/app-state';

// The viewfinder is always dark, whatever the theme.
const VIEWFINDER = '#141414';
const CORNER = '#FFFFFF';
const CAMERA_LABEL = '#BDBDB8';
const TARGET = 220;
const CORNER_SIZE = 36;

type Status = { kind: 'looking' } | { kind: 'reading'; received: number; total: number } | { kind: 'error'; message: string };

export default function Scan() {
  const colors = useColors();
  const focused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const { identity, contacts, setScannedCard } = useAppState();
  const [status, setStatus] = useState<Status>({ kind: 'looking' });
  const assembler = useRef(new FrameAssembler());
  const done = useRef(false);

  useFocusEffect(
    useCallback(() => {
      assembler.current.reset();
      done.current = false;
      setStatus({ kind: 'looking' });
    }, []),
  );

  function onScanned(data: string) {
    if (done.current || !identity) return;

    const progress = assembler.current.add(data);
    if (!progress) {
      setStatus({ kind: 'error', message: 'That is not a Svoboda code.' });
      return;
    }
    if (!progress.card) {
      setStatus({ kind: 'reading', received: progress.received, total: progress.total });
      return;
    }

    done.current = true;
    try {
      const card = decodeContactCard(progress.card);
      const id = bytesToHex(fingerprint(card.encryptionKey, card.signingKey));
      const existing = contacts.find((c) => c.id === id);
      if (id === bytesToHex(identity.fingerprint)) throw new ScanError('This is your own code.');
      if (existing) throw new ScanError(`Already saved as ${existing.name}.`);

      setScannedCard(card);
      router.push('/name-contact');
    } catch (error) {
      setStatus({
        kind: 'error',
        message:
          error instanceof ScanError
            ? error.message
            : error instanceof InvalidContactCardError
              ? 'That is not a Svoboda code.'
              : 'Could not read this code. Try again.',
      });
      // Let the person point at another code after reading the message.
      setTimeout(() => {
        assembler.current.reset();
        done.current = false;
      }, 1500);
    }
  }

  const statusText =
    status.kind === 'reading'
      ? `Reading code · ${status.received} of ${status.total}`
      : status.kind === 'error'
        ? status.message
        : 'Looking for a code…';

  return (
    <Screen>
      <NavBar kind="close" label="Contacts" />

      <View style={[styles.viewfinder, { backgroundColor: VIEWFINDER }]}>
        {permission?.granted ? (
          focused && (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => onScanned(data)}
            />
          )
        ) : (
          <View style={styles.permission}>
            <Text style={[styles.permissionText, { color: CORNER }]}>
              {permission?.canAskAgain === false
                ? 'Camera access is off. Turn it on for Svoboda in Settings to scan codes.'
                : 'Svoboda needs the camera to scan the other person’s code.'}
            </Text>
            {permission?.canAskAgain !== false && (
              <Button label="Allow camera" variant="secondary" onPress={requestPermission} style={styles.allow} />
            )}
          </View>
        )}

        {permission?.granted && (
          <View pointerEvents="none" style={styles.target}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <View style={[styles.scanLine, { backgroundColor: colors.signal }]} />
          </View>
        )}
        <Text style={styles.cameraLabel}>CAMERA</Text>
      </View>

      <View style={styles.copy}>
        <Text style={[styles.heading, { color: colors.ink }]}>Scan their code</Text>
        <Text style={[styles.body, { color: colors.muted }]}>
          Ask the other person to open <Text style={[styles.strong, { color: colors.ink }]}>Be added</Text> and
          point your camera at their code.
        </Text>
      </View>

      <View style={styles.status} accessibilityLiveRegion="polite">
        <View style={[styles.statusDot, { backgroundColor: status.kind === 'error' ? colors.alert : colors.signal }]} />
        <Text style={[styles.statusText, { color: status.kind === 'error' ? colors.alert : colors.muted }]}>
          {statusText}
        </Text>
      </View>
    </Screen>
  );
}

class ScanError extends Error {}

const styles = StyleSheet.create({
  viewfinder: {
    height: 350,
    marginTop: 24,
    marginHorizontal: layout.margin,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  target: {
    width: TARGET,
    height: TARGET,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: CORNER,
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  scanLine: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: TARGET / 2 - 2,
    height: 2,
  },
  cameraLabel: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    fontFamily: fonts.mono,
    fontSize: 11,
    color: CAMERA_LABEL,
  },
  permission: {
    alignItems: 'center',
    gap: spacing[4],
    paddingHorizontal: 32,
  },
  permissionText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  allow: {
    paddingHorizontal: layout.margin,
  },
  copy: {
    gap: spacing[2],
    paddingTop: 24,
    paddingHorizontal: layout.margin,
  },
  heading: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.72,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  strong: {
    fontWeight: '600',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingTop: spacing[4],
    paddingHorizontal: layout.margin,
  },
  statusDot: {
    width: 8,
    height: 8,
  },
  statusText: {
    flexShrink: 1,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
});
