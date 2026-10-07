import { Text as RNText, StyleSheet, type TextProps, type TextStyle } from 'react-native';

import { fonts } from '@/constants/theme';

function familyFor(weight: TextStyle['fontWeight']) {
  const numeric = weight === 'bold' ? 700 : Number(weight) || 400;
  if (numeric >= 800) return fonts.inter[800];
  if (numeric >= 700) return fonts.inter[700];
  if (numeric >= 600) return fonts.inter[600];
  if (numeric >= 500) return fonts.inter[500];
  return fonts.inter[400];
}

export function Text({ style, ...rest }: TextProps) {
  const { fontWeight, fontFamily, ...flat } = StyleSheet.flatten(style) ?? {};
  return <RNText style={[flat, { fontFamily: fontFamily ?? familyFor(fontWeight) }]} {...rest} />;
}
