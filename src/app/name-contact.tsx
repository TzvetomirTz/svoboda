import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ScreenTitle } from '@/components/screen-title';
import { Text } from '@/components/text';
import { NavBar } from '@/components/top-bar';
import { fonts, layout, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { makeContact } from '@/lib/contacts';
import { formatFingerprint } from '@/lib/fingerprint';
import { useAppState } from '@/state/app-state';

export default function NameContact() {
  const colors = useColors();
  const { identity, scannedCard, setScannedCard, addContact, selectContact } = useAppState();
  const [name, setName] = useState(scannedCard?.name ?? '');

  if (!identity || !scannedCard) return <Redirect href="/" />;

  const contact = makeContact(name.trim(), scannedCard.encryptionKey, scannedCard.signingKey);
  const [line1, line2] = [formatFingerprint(contact.fingerprint).slice(0, 19), formatFingerprint(contact.fingerprint).slice(20)];
  const firstName = scannedCard.name.split(' ')[0] || 'their';

  function save() {
    addContact(contact);
    selectContact(contact.id);
    setScannedCard(null);
    router.dismissTo('/send');
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <NavBar kind="back" label="New contact" />
        <ScreenTitle>Code scanned</ScreenTitle>

        <View style={styles.field}>
          <Text style={[typography.label, { color: colors.muted }]} nativeID="contact-name-label">
            Name this contact
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={colors.muted}
            accessibilityLabelledBy="contact-name-label"
            autoCapitalize="words"
            returnKeyType="done"
            maxLength={40}
            style={[styles.input, { color: colors.ink, borderBottomColor: colors.ink }]}
          />
        </View>

        <View style={[styles.fingerprintBox, { backgroundColor: colors.surface }]}>
          <Text style={[typography.label, { color: colors.muted }]}>Fingerprint</Text>
          <Text style={[styles.fingerprint, { color: colors.ink }]}>
            {line1}
            {'\n'}
            {line2}
          </Text>
          <Text style={[styles.help, { color: colors.muted }]}>
            It should match the fingerprint under {firstName === 'their' ? 'their' : `${firstName}’s`} code. Compare
            the first and last groups out loud.
          </Text>
        </View>

        <View style={styles.footer}>
          <Button label="Save contact" onPress={save} disabled={name.trim().length === 0} />
          <Button label="Cancel" variant="quiet" onPress={() => router.back()} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  field: {
    gap: spacing[2],
    paddingTop: 28,
    paddingHorizontal: layout.margin,
  },
  input: {
    minHeight: 52,
    padding: 0,
    borderBottomWidth: layout.rule,
    fontFamily: fonts.inter[500],
    fontSize: 20,
    letterSpacing: -0.4,
  },
  fingerprintBox: {
    gap: 10,
    marginTop: 28,
    marginHorizontal: layout.margin,
    padding: spacing[4],
  },
  fingerprint: {
    fontFamily: fonts.mono,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.36,
  },
  help: {
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    marginTop: 'auto',
    gap: spacing[2],
    paddingHorizontal: layout.margin,
    paddingBottom: 40,
  },
});
