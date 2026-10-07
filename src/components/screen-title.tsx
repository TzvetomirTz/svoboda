import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { layout, typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';

/** Big flush-left title, then the 2px ink rule. */
export function ScreenTitle({ children }: { children: string }) {
  const colors = useColors();
  return (
    <>
      <Text style={[typography.display, styles.title, { color: colors.ink }]} accessibilityRole="header">
        {children}
      </Text>
      <View style={[styles.rule, { backgroundColor: colors.ink }]} />
    </>
  );
}

// The brand book sets 56px titles on a 52px line. Native text clips glyphs that rise above a line
// shorter than the font, so draw on a taller line and pull it back to keep the designed spacing.
const TITLE_LINE_HEIGHT = 64;
const LINE_OVERFLOW = (TITLE_LINE_HEIGHT - typography.display.lineHeight) / 2;

const styles = StyleSheet.create({
  title: {
    paddingTop: 24,
    paddingHorizontal: layout.margin,
    lineHeight: TITLE_LINE_HEIGHT,
    marginVertical: -LINE_OVERFLOW,
  },
  rule: {
    height: layout.rule,
    marginTop: layout.margin,
    marginHorizontal: layout.margin,
  },
});
