import { Text as RNText, StyleSheet, type TextProps, type TextStyle } from 'react-native';

const families = {
  '400': 'Inter_400Regular',
  '500': 'Inter_500Medium',
  '600': 'Inter_600SemiBold',
  '700': 'Inter_700Bold',
} as const;

function familyFor(weight: TextStyle['fontWeight']) {
  const numeric = weight === 'bold' ? 700 : Number(weight) || 400;
  if (numeric >= 700) return families['700'];
  if (numeric >= 600) return families['600'];
  if (numeric >= 500) return families['500'];
  return families['400'];
}

export function Text({ style, ...rest }: TextProps) {
  const { fontWeight, fontFamily, ...flat } = StyleSheet.flatten(style) ?? {};
  return <RNText style={[flat, { fontFamily: fontFamily ?? familyFor(fontWeight) }]} {...rest} />;
}
