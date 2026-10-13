import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { ContactSelect } from '@/components/contact-select';
import { CopyIcon } from '@/components/icons';
import { FirstUseTip } from '@/components/keyboard/first-use-tip';
import { KeyboardButton } from '@/components/keyboard/keyboard-button';
import { MessageView } from '@/components/keyboard/message-view';
import { SvobodaKeyboard } from '@/components/keyboard/svoboda-keyboard';
import { Screen } from '@/components/screen';
import { ScreenTitle } from '@/components/screen-title';
import { Text } from '@/components/text';
import { MainActions, WordmarkBar } from '@/components/top-bar';
import { fonts, layout, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import {
  clearBuffer,
  deleteBackward,
  emptyBuffer,
  insertText,
  moveCursor,
  replaceSelection,
  replaceText,
  setCursor,
  textBeforeCursor,
  type MessageBuffer,
} from '@/lib/keyboard/buffer';
import { currentLayout } from '@/lib/keyboard/languages';
import { layoutById, type Layout } from '@/lib/keyboard/layouts';
import { updateKeyboardPreferences, useKeyboardPreferences } from '@/lib/keyboard/preferences';
import { shouldAutoCapitalize } from '@/lib/keyboard/shift';
import { encryptMessage } from '@/lib/message';
import { useAppState } from '@/state/app-state';
import { useHideMainChrome } from '@/state/main-chrome';
import { SecureInputView, setSensitiveClipboardString } from '../../../modules/svoboda-secure';

// The message lives only in `buffer`, in memory: never logged, stored or put in an error. It is
// cleared once its encrypted copy is on the clipboard.

/** Which keyboard is showing. The two are never on screen at once. */
type KeyboardMode = 'none' | 'system' | 'svoboda';

type Outcome = { state: 'encrypting' | 'copied' | 'failed'; contactId: string; revision: number };

const MESSAGE_PADDING = spacing[4];
const KEYBOARD_BUTTON_CENTER = MESSAGE_PADDING + 22;

export default function Send() {
  const colors = useColors();
  const { identity, selectedContact } = useAppState();
  const preferences = useKeyboardPreferences();
  const [buffer, setBuffer] = useState<MessageBuffer>(emptyBuffer);
  const [keyboard, setKeyboard] = useState<KeyboardMode>('none');
  // Handed to the TextInput once when it comes back, so the cursor survives a keyboard switch.
  // Otherwise its selection stays uncontrolled: controlled selection makes the cursor jump.
  const [restoreSelection, setRestoreSelection] = useState<MessageBuffer['selection'] | undefined>();
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const inputRef = useRef<TextInput>(null);

  const svoboda = keyboard === 'svoboda';
  useHideMainChrome(svoboda);

  // An edit or another recipient makes an earlier "Copied" or failure stale.
  const state =
    outcome && outcome.contactId === selectedContact?.id && outcome.revision === buffer.revision ? outcome.state : 'idle';
  const canEncrypt = !!selectedContact && buffer.text.trim().length > 0 && state !== 'encrypting';

  const layoutNow = currentLayout(preferences.enabled, preferences.current);
  const enabledLayouts = preferences.enabled.map(layoutById).filter((l): l is Layout => l !== undefined);

  function copyEncrypted() {
    if (!identity || !selectedContact || !canEncrypt) return;
    const text = buffer.text;
    const revision = buffer.revision;
    const contactId = selectedContact.id;
    setOutcome({ state: 'encrypting', contactId, revision });
    // Let the button show its busy state before signing blocks the JS thread.
    setTimeout(async () => {
      try {
        const encrypted = encryptMessage(
          text,
          { fingerprint: identity.fingerprint, signingSecretKey: identity.signing.secretKey },
          { fingerprint: selectedContact.fingerprint, encryptionKey: selectedContact.encryptionKey },
        );
        await setSensitiveClipboardString(encrypted);
        // Clear the message, unless it was edited while encrypting.
        setBuffer((current) => (current.revision === revision ? clearBuffer(current) : current));
        setOutcome({ state: 'copied', contactId, revision: revision + 1 });
      } catch {
        // Deliberately not logged: the error could carry message contents.
        setOutcome({ state: 'failed', contactId, revision });
      }
    }, 0);
  }

  function openSvobodaKeyboard() {
    if (keyboard === 'system') {
      inputRef.current?.blur();
      Keyboard.dismiss();
    }
    // A selection made with the system keyboard collapses to its end: our caret has no range.
    setBuffer((current) => setCursor(current, current.selection.end));
    setKeyboard('svoboda');
    if (!preferences.tipSeen) dismissTip();
  }

  function hideSvobodaKeyboard() {
    setRestoreSelection(buffer.selection);
    setKeyboard('none');
  }

  function encryptFromKeyboard() {
    hideSvobodaKeyboard();
    copyEncrypted();
  }

  function dismissTip() {
    updateKeyboardPreferences(() => ({ tipSeen: true }));
  }

  const firstName = selectedContact?.name.split(' ')[0];
  const count = buffer.text.length;
  const messageStyle = [styles.messageText, { color: colors.ink }];

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, svoboda && styles.contentFilled]}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!svoboda}>
          <WordmarkBar right={<MainActions />} />
          {!svoboda && <ScreenTitle>Send</ScreenTitle>}
          <ContactSelect label="To" />

          <View style={[styles.field, svoboda && styles.fieldFilled]}>
            <Text style={[typography.label, { color: colors.muted }]} nativeID="message-label">
              Message
            </Text>
            <SecureInputView
              style={[styles.messageBox, svoboda && styles.messageBoxFilled, { backgroundColor: colors.surface }]}>
              {svoboda ? (
                <MessageView
                  text={buffer.text}
                  cursor={buffer.selection.end}
                  placeholder="Write a message"
                  textStyle={styles.messageText}
                  textColor={colors.ink}
                  placeholderColor={colors.muted}
                  caretColor={colors.signal}
                  accessibilityLabel="Message"
                  onCursorChange={(index) => setBuffer((current) => setCursor(current, index))}
                  onCursorStep={(direction) => setBuffer((current) => moveCursor(current, direction))}
                />
              ) : (
                <TextInput
                  ref={inputRef}
                  testID="message-input"
                  value={buffer.text}
                  selection={restoreSelection}
                  onChangeText={(text) => setBuffer((current) => replaceText(current, text))}
                  onSelectionChange={(e) => {
                    const { selection } = e.nativeEvent;
                    setBuffer((current) => replaceSelection(current, selection));
                    if (restoreSelection) setRestoreSelection(undefined);
                  }}
                  onFocus={() => setKeyboard('system')}
                  // Switching to the Svoboda keyboard blurs the input; don't undo that switch.
                  onBlur={() => setKeyboard((current) => (current === 'system' ? 'none' : current))}
                  multiline
                  placeholder="Write a message"
                  placeholderTextColor={colors.muted}
                  accessibilityLabelledBy="message-label"
                  textAlignVertical="top"
                  // No suggestions, corrections or autofill. On Android the native container also
                  // asks the keyboard not to learn from what is typed here.
                  autoCorrect={false}
                  spellCheck={false}
                  autoComplete="off"
                  textContentType="none"
                  importantForAutofill="no"
                  style={[styles.input, messageStyle]}
                />
              )}
              <View style={styles.messageFooter}>
                <KeyboardButton open={svoboda} onPress={openSvobodaKeyboard} />
                <Text style={[styles.counter, { color: colors.muted }]}>
                  {count} {count === 1 ? 'char' : 'chars'}
                </Text>
              </View>
            </SecureInputView>
            {!preferences.tipSeen && !svoboda && (
              <FirstUseTip pointerLeft={KEYBOARD_BUTTON_CENTER} onDismiss={dismissTip} />
            )}
          </View>

          {!svoboda && (
            <View style={styles.actions}>
              <Button
                label={state === 'copied' ? 'Copied' : state === 'encrypting' ? 'Encrypting' : 'Copy encrypted'}
                icon={CopyIcon}
                onPress={copyEncrypted}
                disabled={!canEncrypt && state !== 'encrypting'}
                busy={state === 'encrypting'}
              />
              {state === 'failed' ? (
                <Text style={[styles.hint, { color: colors.alert }]}>Could not encrypt this message. Try again.</Text>
              ) : (
                selectedContact && (
                  <Text style={[styles.hint, { color: colors.muted }]} accessibilityLiveRegion="polite">
                    {state === 'copied'
                      ? `Paste it into any messenger. Only ${firstName} can read it.`
                      : `Only ${firstName} can read it. Signed by you.`}
                  </Text>
                )
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {svoboda && (
        <SvobodaKeyboard
          layout={layoutNow}
          enabledLayouts={enabledLayouts}
          autoCapitalize={shouldAutoCapitalize(textBeforeCursor(buffer))}
          revision={buffer.revision}
          encryptDisabled={!canEncrypt}
          onInsert={(text) => setBuffer((current) => insertText(current, text))}
          onDelete={() => setBuffer(deleteBackward)}
          onEncrypt={encryptFromKeyboard}
          onHide={hideSvobodaKeyboard}
          onSwitchLanguage={(id) => updateKeyboardPreferences(() => ({ current: id }))}
          onManageLanguages={() => router.push('/keyboard-languages')}
        />
      )}
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
  contentFilled: {
    flexGrow: 1,
    paddingBottom: spacing[4],
  },
  field: {
    gap: spacing[2],
    paddingTop: layout.margin,
    paddingHorizontal: layout.margin,
  },
  fieldFilled: {
    flex: 1,
  },
  messageBox: {
    height: 248,
    padding: MESSAGE_PADDING,
    gap: 12,
  },
  messageBoxFilled: {
    flex: 1,
    height: undefined,
  },
  // Shared by the TextInput and the Svoboda keyboard's text view, so switching never moves the text.
  messageText: {
    fontFamily: fonts.inter[400],
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.18,
  },
  input: {
    flex: 1,
    padding: 0,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  counter: {
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
