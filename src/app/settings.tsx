import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { CheckIcon } from '@/components/icons';
import { OblivionWareLogo } from '@/components/oblivionware-logo';
import { Screen } from '@/components/screen';
import { ScreenTitle } from '@/components/screen-title';
import { Text } from '@/components/text';
import { NavBar } from '@/components/top-bar';
import { fonts, layout, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { formatFingerprint } from '@/lib/fingerprint';
import { deleteIdentity } from '@/lib/identity';
import { applyTheme, loadTheme, saveTheme, type ThemePreference } from '@/lib/theme';
import { useAppState } from '@/state/app-state';

const OBLIVIONWARE_URL = 'https://oblivionware.com';

const themes: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Same as phone' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function Settings() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { identity, setIdentity } = useAppState();
  const [theme, setTheme] = useState(loadTheme);
  const [deleting, setDeleting] = useState(false);

  if (!identity) return <Redirect href="/" />;

  const [line1, line2] = [formatFingerprint(identity.fingerprint).slice(0, 19), formatFingerprint(identity.fingerprint).slice(20)];

  function chooseTheme(next: ThemePreference) {
    setTheme(next);
    applyTheme(next);
    try {
      saveTheme(next);
    } catch (error) {
      console.error('Could not save theme', error);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Delete your identity?',
      'Your private key is erased from this phone. Messages sent to you can no longer be decrypted. Your contacts stay, but they will need to scan your new code.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: remove },
      ],
    );
  }

  async function remove() {
    setDeleting(true);
    try {
      await deleteIdentity();
      router.dismissAll();
      router.replace('/create-identity');
      setIdentity(null);
    } catch (error) {
      console.error('Could not delete identity', error);
      setDeleting(false);
      Alert.alert('Could not delete your identity', 'Nothing was changed. Try again.');
    }
  }

  return (
    <Screen>
      <NavBar kind="back" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: spacing[8] + insets.bottom }]}>
        <ScreenTitle>Settings</ScreenTitle>

        <View style={styles.section}>
          <Text style={[typography.label, styles.sectionLabel, { color: colors.muted }]} nativeID="theme-label">
            Appearance
          </Text>
          <View accessibilityRole="radiogroup" accessibilityLabelledBy="theme-label" style={{ borderTopColor: colors.line, borderTopWidth: layout.hairline }}>
            {themes.map(({ value, label }) => {
              const selected = theme === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => chooseTheme(value)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  style={({ pressed }) => [styles.row, { borderBottomColor: colors.line }, pressed && styles.pressed]}>
                  <Text style={[styles.rowText, { color: colors.ink }]}>{label}</Text>
                  {selected && <CheckIcon color={colors.ink} size={18} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[typography.label, styles.sectionLabel, { color: colors.muted }]}>Your identity</Text>
          <View style={[styles.identity, { borderTopColor: colors.line, borderBottomColor: colors.line }]}>
            <Text style={[styles.name, { color: colors.ink }]} numberOfLines={1}>
              {identity.name}
            </Text>
            <Text style={[styles.fingerprint, { color: colors.ink }]} accessibilityLabel={`Fingerprint ${line1} ${line2}`}>
              {line1}
              {'\n'}
              {line2}
            </Text>
          </View>
          <Text style={[styles.help, { color: colors.muted }]}>
            To start over with a new key pair, delete this identity. This can’t be undone.
          </Text>
          <Button
            label={deleting ? 'Deleting identity' : 'Delete identity'}
            variant="danger"
            onPress={confirmDelete}
            busy={deleting}
            style={styles.delete}
          />
        </View>

        <Pressable
          onPress={() => Linking.openURL(OBLIVIONWARE_URL)}
          accessibilityRole="link"
          accessibilityLabel="Powered by OblivionWare"
          accessibilityHint="Opens oblivionware.com in your browser"
          hitSlop={8}
          style={({ pressed }) => [styles.credit, pressed && styles.pressed]}>
          <OblivionWareLogo color={colors.muted} size={14} />
          <Text style={[typography.caption, { color: colors.muted }]}>Powered by OblivionWare</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  section: {
    paddingTop: spacing[8],
    paddingHorizontal: layout.margin,
  },
  sectionLabel: {
    marginBottom: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    borderBottomWidth: layout.hairline,
  },
  rowText: {
    fontSize: 17,
  },
  pressed: {
    opacity: 0.6,
  },
  identity: {
    gap: spacing[2],
    paddingVertical: 12,
    borderTopWidth: layout.hairline,
    borderBottomWidth: layout.hairline,
  },
  name: {
    ...typography.title,
  },
  fingerprint: {
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 19,
  },
  help: {
    ...typography.small,
    marginTop: spacing[4],
  },
  delete: {
    marginTop: spacing[4],
  },
  // Pinned to the bottom when the settings are shorter than the screen.
  credit: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing[2],
    marginTop: 'auto',
    paddingTop: spacing[12],
  },
});
