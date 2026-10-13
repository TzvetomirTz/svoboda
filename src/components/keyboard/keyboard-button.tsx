import { Pressable, StyleSheet } from 'react-native';

import { KeyboardIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { layout, radius } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';

/** "Svoboda keyboard" in the message box. Always opens the Svoboda keyboard; never a toggle. */
export function KeyboardButton({ open, onPress }: { open: boolean; onPress: () => void }) {
  const colors = useColors();
  const color = open ? colors.paper : colors.ink;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Svoboda keyboard"
      accessibilityHint={open ? undefined : 'Type without a keyboard app'}
      accessibilityState={{ selected: open }}
      style={({ pressed }) => [
        styles.button,
        { borderColor: colors.ink, backgroundColor: open ? colors.ink : 'transparent' },
        pressed && styles.pressed,
      ]}>
      <KeyboardIcon color={color} />
      <Text style={[styles.label, { color }]} maxFontSizeMultiplier={1.4}>
        Svoboda keyboard
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 14,
    borderWidth: layout.rule,
    borderRadius: radius.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.86,
  },
});
