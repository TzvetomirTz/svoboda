import type { ReactNode, Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type AccessibilityActionEvent,
  type AccessibilityActionInfo,
  type Insets,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { KEYBOARD } from '@/components/keyboard/geometry';
import { Text } from '@/components/text';
import { useColors } from '@/hooks/use-colors';
import { keyHaptic } from '@/lib/keyboard/haptics';

export type KeyTone = 'plain' | 'ink' | 'active';

/** Key labels may grow with the system font size, but only so far: the key grid can't. */
export const KEY_LABEL_MAX_SCALE = 1.3;

/**
 * One key of the Svoboda keyboard: flat surface, 4px radius, `line` while pressed. `ink` is the
 * Encrypt key; `active` is shift on or the language key with its picker open.
 */
export function Key({
  label,
  children,
  accessibilityLabel,
  accessibilityHint,
  accessibilityActions,
  onAccessibilityAction,
  onPress,
  onPressIn,
  onPressOut,
  onLongPress,
  pressRetentionOffset,
  tone = 'plain',
  disabled = false,
  selected,
  labelStyle,
  style,
  ref,
}: {
  label?: string;
  children?: (color: string) => ReactNode;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityActions?: AccessibilityActionInfo[];
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onLongPress?: () => void;
  pressRetentionOffset?: Insets;
  tone?: KeyTone;
  disabled?: boolean;
  selected?: boolean;
  labelStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  ref?: Ref<View>;
}) {
  const colors = useColors();
  const filled = tone === 'ink' || tone === 'active';
  const color = filled ? colors.paper : colors.ink;

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      onPressIn={() => {
        keyHaptic();
        onPressIn?.();
      }}
      onPressOut={onPressOut}
      onLongPress={onLongPress}
      delayLongPress={350}
      pressRetentionOffset={pressRetentionOffset}
      disabled={disabled}
      accessibilityRole="keyboardkey"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, selected }}
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction}
      style={({ pressed }) => [
        styles.key,
        { backgroundColor: filled ? colors.ink : pressed ? colors.line : colors.surface },
        filled && pressed && styles.pressedFilled,
        disabled && styles.disabled,
        style,
      ]}>
      {children
        ? children(color)
        : label !== undefined && (
            <Text style={[styles.label, { color }, labelStyle]} maxFontSizeMultiplier={KEY_LABEL_MAX_SCALE}>
              {label}
            </Text>
          )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  key: {
    height: KEYBOARD.keyHeight,
    borderRadius: KEYBOARD.keyRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 20,
    fontWeight: '400',
  },
  pressedFilled: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.4,
  },
});
