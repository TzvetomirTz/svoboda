import { File, Paths } from 'expo-file-system';
import { Appearance } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

// A plain file next to contacts: read synchronously at startup, before the first screen draws.
const file = new File(Paths.document, 'theme.json');

export function loadTheme(): ThemePreference {
  try {
    if (!file.exists) return 'system';
    const theme = JSON.parse(file.textSync()) as unknown;
    return theme === 'light' || theme === 'dark' ? theme : 'system';
  } catch (error) {
    console.error('Could not load theme', error);
    return 'system';
  }
}

export function saveTheme(theme: ThemePreference) {
  if (!file.exists) file.create();
  file.write(JSON.stringify(theme));
}

/** Overrides the system appearance for the whole app, which `useColorScheme` then reports. */
export function applyTheme(theme: ThemePreference) {
  Appearance.setColorScheme(theme === 'system' ? 'unspecified' : theme);
}
