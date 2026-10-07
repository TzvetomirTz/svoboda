import type { TabTriggerSlotProps } from 'expo-router/ui';
import type { ReactNode, Ref } from 'react';
import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/text';
import { radius } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';

// The round switch floating at the bottom of Send/Receive and Add someone/Be added.
// Use inside expo-router/ui tabs: <TabList asChild><PillBar><TabTrigger asChild><PillButton/>…

export function PillBar({ children, style, ...props }: ViewProps & { children: ReactNode }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();

  return (
    <View
      {...props}
      accessibilityRole="tablist"
      style={[
        style,
        styles.bar,
        { backgroundColor: colors.ink, bottom: Math.max(insets.bottom, 20) },
        keyboardVisible && styles.hidden,
      ]}>
      {children}
    </View>
  );
}

export function PillButton({
  label,
  width,
  isFocused,
  ref,
  ...props
}: TabTriggerSlotProps & { label: string; width: number; ref?: Ref<View> }) {
  const colors = useColors();
  return (
    <Pressable
      ref={ref}
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={[styles.item, { width }, isFocused && { backgroundColor: colors.paper }]}>
      <Text style={[styles.label, { color: isFocused ? colors.ink : colors.paper }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.pill,
  },
  hidden: {
    display: 'none',
  },
  item: {
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
