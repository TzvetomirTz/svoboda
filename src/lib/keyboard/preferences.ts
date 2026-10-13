import { File, Paths } from 'expo-file-system';
import { useSyncExternalStore } from 'react';

import { defaultEnabled, sanitizeEnabled } from '@/lib/keyboard/languages';

// Svoboda keyboard preferences: enabled languages and their order, the last language used, and
// whether the first-use tip was seen. None of it is sensitive, so it lives in a plain file next to
// the theme. Never put message text here.

export type KeyboardPreferences = {
  enabled: string[];
  current: string;
  tipSeen: boolean;
};

const FILE_NAME = 'keyboard.json';

function deviceLanguage(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return undefined;
  }
}

function file() {
  return new File(Paths.document, FILE_NAME);
}

function load(): KeyboardPreferences {
  try {
    const f = file();
    if (f.exists) {
      const raw = JSON.parse(f.textSync()) as Partial<KeyboardPreferences>;
      const enabled = sanitizeEnabled(raw.enabled);
      return {
        enabled,
        current: typeof raw.current === 'string' && enabled.includes(raw.current) ? raw.current : enabled[0],
        tipSeen: raw.tipSeen === true,
      };
    }
  } catch (error) {
    console.error('Could not load keyboard preferences', error);
  }
  const enabled = defaultEnabled(deviceLanguage());
  return { enabled, current: enabled[0], tipSeen: false };
}

function save(preferences: KeyboardPreferences) {
  try {
    const f = file();
    if (!f.exists) f.create();
    f.write(JSON.stringify(preferences));
  } catch (error) {
    console.error('Could not save keyboard preferences', error);
  }
}

let state: KeyboardPreferences | null = null;
const listeners = new Set<() => void>();

function snapshot(): KeyboardPreferences {
  state ??= load();
  return state;
}

export function updateKeyboardPreferences(change: (current: KeyboardPreferences) => Partial<KeyboardPreferences>) {
  const previous = snapshot();
  const merged = { ...previous, ...change(previous) };
  const enabled = sanitizeEnabled(merged.enabled);
  state = { ...merged, enabled, current: enabled.includes(merged.current) ? merged.current : enabled[0] };
  save(state);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useKeyboardPreferences(): KeyboardPreferences {
  return useSyncExternalStore(subscribe, snapshot);
}

/** For tests: forget the cached preferences. */
export function resetKeyboardPreferencesForTests(next?: KeyboardPreferences) {
  state = next ?? null;
}
