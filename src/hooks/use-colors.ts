import { useColorScheme } from 'react-native';

import { colors } from '@/constants/theme';

export function useColors() {
  return colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
