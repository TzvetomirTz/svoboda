import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

import { Text } from '@/components/text';
import { fonts, layout, radius, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { createIdentity } from '@/lib/identity';

const details = [
  { label: 'Encryption', value: 'ML-KEM-768' },
  { label: 'Signatures', value: 'ML-DSA-65' },
  { label: 'Stored in', value: 'Device keychain' },
];

export default function CreateIdentity() {
  const colors = useColors();
  const [name, setName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = name.trim();
  const disabled = trimmed.length === 0 || generating;

  function generate() {
    setGenerating(true);
    setError(null);
    // Let "Generating keys" render before key generation blocks the JS thread.
    setTimeout(async () => {
      try {
        await createIdentity(trimmed);
        router.replace('/splash');
      } catch (e) {
        console.error('Could not create identity', e);
        setError('Could not create your identity. Try again.');
        setGenerating(false);
      }
    }, 0);
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.paper }]}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.top}>
          <Text style={[styles.wordmark, { color: colors.ink }]}>Svoboda.</Text>
          <Text style={[styles.topMeta, { color: colors.muted }]}>Setup</Text>
        </View>

        <Text style={[styles.title, { color: colors.ink }]} accessibilityRole="header">
          Create your identity
        </Text>
        <View style={[styles.rule, { backgroundColor: colors.ink }]} />

        <Text style={[styles.intro, { color: colors.muted }]}>
          Svoboda generates a key pair on this device. The public key is what you share. The private key never
          leaves your phone.
        </Text>

        <View style={styles.field}>
          <Text style={[typography.label, { color: colors.muted }]} nativeID="name-label">
            Your name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={colors.muted}
            accessibilityLabelledBy="name-label"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="done"
            maxLength={40}
            editable={!generating}
            style={[styles.input, { color: colors.ink, borderBottomColor: colors.ink }]}
          />
          <Text style={[styles.help, { color: colors.muted }]}>Shown to people who scan your code.</Text>
        </View>

        <View style={[styles.details, { borderTopColor: colors.line }]}>
          {details.map(({ label, value }) => (
            <View key={label} style={[styles.detailRow, { borderBottomColor: colors.line }]}>
              <Text style={[typography.small, { color: colors.muted }]}>{label}</Text>
              <Text style={[styles.detailValue, { color: colors.ink }]}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          {error && <Text style={[styles.help, { color: colors.alert }]}>{error}</Text>}
          <Pressable
            onPress={generate}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ disabled, busy: generating }}
            style={({ pressed }) => [
              styles.button,
              disabled
                ? { backgroundColor: colors.paper, borderColor: colors.line }
                : { backgroundColor: colors.ink, borderColor: colors.ink },
              pressed && styles.pressed,
            ]}>
            <LockIcon color={disabled ? colors.muted : colors.paper} />
            <Text style={[styles.buttonText, { color: disabled ? colors.muted : colors.paper }]}>
              {generating ? 'Generating keys' : 'Generate keys'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function LockIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="square">
      <Rect x={5} y={11} width={14} height={10} />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingTop: spacing[2],
    paddingHorizontal: layout.margin,
  },
  wordmark: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  topMeta: {
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  title: {
    ...typography.display,
    paddingTop: 24,
    paddingHorizontal: layout.margin,
  },
  rule: {
    height: layout.rule,
    marginTop: layout.margin,
    marginHorizontal: layout.margin,
  },
  intro: {
    ...typography.body,
    marginTop: layout.margin,
    marginHorizontal: layout.margin,
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
  help: {
    fontSize: 13,
  },
  details: {
    marginTop: 28,
    marginHorizontal: layout.margin,
    borderTopWidth: layout.hairline,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: layout.hairline,
  },
  detailValue: {
    ...typography.code,
    fontSize: 13,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: layout.margin,
    paddingBottom: 40,
    gap: spacing[2],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: layout.buttonHeight,
    borderRadius: radius.sm,
    borderWidth: layout.rule,
  },
  pressed: {
    opacity: 0.86,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.16,
  },
});
