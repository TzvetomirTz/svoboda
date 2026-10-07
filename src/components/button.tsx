import type { ComponentType } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/text';
import { layout, radius } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';

type Variant = 'primary' | 'secondary' | 'quiet';

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  disabled = false,
  busy = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: ComponentType<{ color: string; size?: number }>;
  disabled?: boolean;
  busy?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const inactive = disabled || busy;

  const look = {
    primary: { backgroundColor: colors.ink, borderColor: colors.ink, color: colors.paper },
    secondary: { backgroundColor: colors.paper, borderColor: colors.ink, color: colors.ink },
    quiet: { backgroundColor: 'transparent', borderColor: 'transparent', color: colors.ink },
  }[variant];
  const color = disabled && variant !== 'quiet' ? colors.muted : look.color;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy }}
      style={({ pressed }) => [
        styles.button,
        variant === 'quiet' && styles.quiet,
        { backgroundColor: look.backgroundColor, borderColor: look.borderColor },
        disabled && variant !== 'quiet' && { backgroundColor: colors.paper, borderColor: colors.line },
        disabled && variant === 'quiet' && styles.dimmed,
        pressed && styles.pressed,
        style,
      ]}>
      {Icon && <Icon color={color} size={variant === 'quiet' ? 16 : 18} />}
      <Text style={[styles.label, variant === 'quiet' && styles.quietLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: layout.buttonHeight,
    borderRadius: radius.sm,
    borderWidth: layout.rule,
  },
  quiet: {
    minHeight: 44,
    paddingHorizontal: 12,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.16,
  },
  quietLabel: {
    fontSize: 14,
  },
  pressed: {
    opacity: 0.86,
  },
  dimmed: {
    opacity: 0.4,
  },
});
