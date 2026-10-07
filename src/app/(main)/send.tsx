import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { ContactSelect } from '@/components/contact-select';
import { CopyIcon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { ScreenTitle } from '@/components/screen-title';
import { Text } from '@/components/text';
import { MainActions, WordmarkBar } from '@/components/top-bar';
import { fonts, layout, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { encryptMessage } from '@/lib/message';
import { useAppState } from '@/state/app-state';

export default function Send() {
  const colors = useColors();
  const { identity, selectedContact } = useAppState();
  const [message, setMessage] = useState('');
  const [outcome, setOutcome] = useState<{
    state: 'encrypting' | 'copied' | 'failed';
    message: string;
    contactId: string;
  } | null>(null);

  // Editing the message or switching recipient makes an earlier "Copied" stale.
  const state =
    outcome && outcome.message === message && outcome.contactId === selectedContact?.id ? outcome.state : 'idle';

  function copyEncrypted() {
    if (!identity || !selectedContact) return;
    const attempt = { message, contactId: selectedContact.id };
    const setState = (state: 'encrypting' | 'copied' | 'failed') => setOutcome({ ...attempt, state });
    setState('encrypting');
    // Let the button show its busy state before signing blocks the JS thread.
    setTimeout(async () => {
      try {
        const encrypted = encryptMessage(
          message,
          { fingerprint: identity.fingerprint, signingSecretKey: identity.signing.secretKey },
          { fingerprint: selectedContact.fingerprint, encryptionKey: selectedContact.encryptionKey },
        );
        await Clipboard.setStringAsync(encrypted);
        setState('copied');
      } catch (error) {
        console.error('Could not encrypt message', error);
        setState('failed');
      }
    }, 0);
  }

  const firstName = selectedContact?.name.split(' ')[0];

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <WordmarkBar right={<MainActions />} />
          <ScreenTitle>Send</ScreenTitle>
          <ContactSelect label="To" />

          <View style={styles.field}>
            <Text style={[typography.label, { color: colors.muted }]} nativeID="message-label">
              Message
            </Text>
            <View style={[styles.messageBox, { backgroundColor: colors.surface }]}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                multiline
                placeholder="Write a message"
                placeholderTextColor={colors.muted}
                accessibilityLabelledBy="message-label"
                textAlignVertical="top"
                style={[styles.messageInput, { color: colors.ink }]}
              />
              <Text style={[styles.counter, { color: colors.muted }]}>
                {message.length} {message.length === 1 ? 'char' : 'chars'}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              label={state === 'copied' ? 'Copied' : state === 'encrypting' ? 'Encrypting' : 'Copy encrypted'}
              icon={CopyIcon}
              onPress={copyEncrypted}
              disabled={!selectedContact || message.trim().length === 0}
              busy={state === 'encrypting'}
            />
            {state === 'failed' ? (
              <Text style={[styles.hint, { color: colors.alert }]}>Could not encrypt this message. Try again.</Text>
            ) : (
              selectedContact && (
                <Text style={[styles.hint, { color: colors.muted }]}>
                  {state === 'copied'
                    ? `Paste it into any messenger. Only ${firstName} can read it.`
                    : `Only ${firstName} can read it. Signed by you.`}
                </Text>
              )
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  field: {
    gap: spacing[2],
    paddingTop: layout.margin,
    paddingHorizontal: layout.margin,
  },
  messageBox: {
    height: 208,
    padding: spacing[4],
    justifyContent: 'space-between',
  },
  messageInput: {
    flex: 1,
    padding: 0,
    fontFamily: fonts.inter[400],
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.18,
  },
  counter: {
    alignSelf: 'flex-end',
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  actions: {
    gap: 10,
    paddingTop: layout.margin,
    paddingHorizontal: layout.margin,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
  },
});
