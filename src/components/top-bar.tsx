import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BackIcon, CloseIcon, ContactsIcon, GearIcon, PlusIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { layout, radius, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';

const TOUCH = 44;

/** Wordmark on the left, with optional content on the right. */
export function WordmarkBar({ right }: { right?: ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.bar}>
      <Text style={[styles.wordmark, { color: colors.ink }]}>Svoboda.</Text>
      {right}
    </View>
  );
}

/** The Settings and Contacts links and round plus button of the main screens. */
export function MainActions() {
  const colors = useColors();
  return (
    <View style={styles.actions}>
      <Pressable
        onPress={() => router.push('/settings')}
        accessibilityRole="button"
        accessibilityLabel="Settings"
        hitSlop={4}
        style={styles.iconButton}>
        <GearIcon color={colors.ink} />
      </Pressable>
      <Pressable
        onPress={() => router.push('/contacts')}
        accessibilityRole="button"
        accessibilityLabel="Contacts"
        hitSlop={4}
        style={styles.iconButton}>
        <ContactsIcon color={colors.ink} />
      </Pressable>
      <RoundButton label="Add or share contacts" onPress={() => router.push('/connect/scan')} />
    </View>
  );
}

export function RoundButton({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.round, { backgroundColor: colors.ink }, pressed && styles.pressed]}>
      <PlusIcon color={colors.paper} />
    </Pressable>
  );
}

/** Back or close on the left, a label in the middle, optional content on the right. */
export function NavBar({
  kind,
  label,
  onPress = () => router.back(),
  right,
}: {
  kind: 'back' | 'close';
  label?: string;
  onPress?: () => void;
  right?: ReactNode;
}) {
  const colors = useColors();
  const Icon = kind === 'back' ? BackIcon : CloseIcon;
  return (
    <View style={styles.bar}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={kind === 'back' ? 'Back' : 'Close'}
        style={[styles.iconButton, styles.leading]}>
        <Icon color={colors.ink} />
      </Pressable>
      {label && <Text style={[typography.label, { color: colors.muted }]}>{label}</Text>}
      {right ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  iconButton: {
    width: TOUCH,
    height: TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leading: {
    marginLeft: -12,
  },
  round: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.86,
  },
  spacer: {
    width: TOUCH,
  },
});
