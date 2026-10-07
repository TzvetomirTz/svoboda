import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ContactSelect } from '@/components/contact-select';
import { CheckIcon, CopyIcon, PasteIcon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { ScreenTitle } from '@/components/screen-title';
import { Text } from '@/components/text';
import { MainActions, WordmarkBar } from '@/components/top-bar';
import { layout, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { decryptMessage, MessageError } from '@/lib/message';
import { useAppState } from '@/state/app-state';

type Result = { kind: 'decrypted'; text: string; at: Date } | { kind: 'error'; message: string } | null;

export default function Receive() {
  const colors = useColors();
  const { identity, selectedContact } = useAppState();
  const [opened, setOpened] = useState<{ result: Result; contactId: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  // A message shown for one sender shouldn't linger after switching to another.
  const result = opened && opened.contactId === selectedContact?.id ? opened.result : null;

  async function pasteAndDecrypt() {
    if (!identity || !selectedContact) return;
    setBusy(true);
    setCopied(false);
    const pasted = await Clipboard.getStringAsync();

    const contactId = selectedContact.id;
    setTimeout(() => {
      setOpened({ result: open(pasted), contactId });
      setBusy(false);
    }, 0);
  }

  function open(pasted: string): Result {
    if (!identity || !selectedContact) return null;
    if (pasted.trim().length === 0) {
      return { kind: 'error', message: 'Nothing to paste. Copy the encrypted message first.' };
    }
    try {
      const text = decryptMessage(
        pasted,
        { fingerprint: selectedContact.fingerprint, signingKey: selectedContact.signingKey },
        { fingerprint: identity.fingerprint, encryptionSecretKey: identity.encryption.secretKey },
      );
      return { kind: 'decrypted', text, at: new Date() };
    } catch (error) {
      if (!(error instanceof MessageError)) console.error('Could not decrypt message', error);
      const reason = error instanceof MessageError ? error.reason : 'decrypt';
      return {
        kind: 'error',
        message: {
          format: 'This is not a Svoboda message.',
          signature: `Could not verify. This message was not signed by ${selectedContact.name}.`,
          decrypt: 'Could not decrypt. This message was not encrypted for you.',
        }[reason],
      };
    }
  }

  async function copyText(text: string) {
    await Clipboard.setStringAsync(text);
    setCopied(true);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <WordmarkBar right={<MainActions />} />
        <ScreenTitle>Receive</ScreenTitle>
        <ContactSelect label="From" />

        <View style={styles.action}>
          <Button
            label={busy ? 'Decrypting' : 'Paste and decrypt'}
            variant="secondary"
            icon={PasteIcon}
            onPress={pasteAndDecrypt}
            disabled={!selectedContact}
            busy={busy}
          />
        </View>

        {result?.kind === 'error' && (
          <Text style={[styles.error, { color: colors.alert }]} accessibilityLiveRegion="polite">
            {result.message}
          </Text>
        )}

        {result?.kind === 'decrypted' && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <Text style={[typography.label, { color: colors.muted }]}>
                Decrypted · {result.at.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <View style={styles.verified}>
                <CheckIcon color={colors.ink} />
                <Text style={[styles.verifiedLabel, { color: colors.ink }]}>Verified</Text>
              </View>
            </View>
            <Text selectable style={[styles.message, { color: colors.ink }]}>
              {result.text}
            </Text>
            <View style={styles.cardActions}>
              <Button
                label={copied ? 'Copied' : 'Copy text'}
                variant="quiet"
                icon={CopyIcon}
                onPress={() => copyText(result.text)}
              />
              <Button label="Clear" variant="quiet" onPress={() => setOpened(null)} />
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
  },
  action: {
    paddingTop: layout.margin,
    paddingHorizontal: layout.margin,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing[4],
    marginHorizontal: layout.margin,
  },
  card: {
    gap: 14,
    marginTop: layout.margin,
    marginHorizontal: layout.margin,
    padding: spacing[4],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  verifiedLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  message: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing[1],
    marginLeft: -12,
  },
});
