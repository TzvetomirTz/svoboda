import { Pressable, StyleSheet, View } from 'react-native';

import { CloseIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';

/** Shown once, under the message box, pointing up at the Svoboda keyboard button. */
export function FirstUseTip({ pointerLeft, onDismiss }: { pointerLeft: number; onDismiss: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.tip, { backgroundColor: colors.ink }]} accessibilityLiveRegion="polite">
      <View style={[styles.pointer, { left: pointerLeft - POINTER / 2, backgroundColor: colors.ink }]} />
      <Text style={[styles.text, { color: colors.paper }]}>
        For sensitive messages, use the Svoboda keyboard. It keeps your typing away from keyboard apps.
      </Text>
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss tip"
        style={({ pressed }) => [styles.close, pressed && { opacity: 0.6 }]}>
        <CloseIcon color={colors.paper} size={18} />
      </Pressable>
    </View>
  );
}

const POINTER = 12;

const styles = StyleSheet.create({
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: 12,
    paddingLeft: spacing[4],
  },
  pointer: {
    position: 'absolute',
    top: -POINTER / 2,
    width: POINTER,
    height: POINTER,
    transform: [{ rotate: '45deg' }],
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 12,
  },
  close: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
