import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/use-colors';

/** Paper background and top safe area for every screen. */
export function Screen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  // Insets from the app-wide provider, not SafeAreaView: inside a modal that is still being
  // presented, SafeAreaView measures 0 on the first frame and the content slides under the clock.
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.paper, paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
