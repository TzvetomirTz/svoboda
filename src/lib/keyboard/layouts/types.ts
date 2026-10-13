// The shape of a Svoboda keyboard layout. Each language is one data file built from these types,
// so adding a language means adding data, not code. Left-to-right scripts only for now; a
// `direction` field is the place to add right-to-left layouts later.

import { toUpper } from '@/lib/keyboard/shift';

export type LetterKey = {
  /** What the key types. */
  base: string;
  /** What it types with shift or caps lock on. */
  shift: string;
  /** Shown in the long-press strip, lowercase. Uppercased with shift. */
  variants: string[];
};

/** The fixed bottom row: ?123, language, space, Encrypt. */
export type BottomKey = 'symbols' | 'language' | 'space' | 'encrypt';

export type Layout = {
  /** Stable id, stored in preferences. */
  id: string;
  /** ISO 639-1 language, to match the phone's language on first launch. */
  language: string;
  /** Shown on the language key. */
  code: string;
  nativeName: string;
  englishName: string;
  layoutName: string;
  rows: [LetterKey[], LetterKey[], LetterKey[]];
  bottom: BottomKey[];
  /** Shift variants that differ from plain uppercasing, e.g. Turkish i → İ. */
  shiftOverrides?: Record<string, string>;
};

export const standardBottomRow: BottomKey[] = ['symbols', 'language', 'space', 'encrypt'];

/**
 * Keys from a string of characters, with their uppercase and the long-press variants from
 * `variants` (looked up by base character).
 */
export function keys(
  characters: string,
  variants: Record<string, string[]> = {},
  shiftOverrides: Record<string, string> = {},
): LetterKey[] {
  return Array.from(characters).map((base) => ({
    base,
    shift: shiftOverrides[base] ?? toUpper(base),
    variants: variants[base] ?? [],
  }));
}

/**
 * Three letter rows, with long-press variants that already have a key of their own removed (š on
 * the Croatian layout, ä on the German one).
 */
export function letterRows(
  first: LetterKey[],
  second: LetterKey[],
  third: LetterKey[],
): [LetterKey[], LetterKey[], LetterKey[]] {
  const onKeys = new Set([...first, ...second, ...third].map((key) => key.base));
  const clean = (row: LetterKey[]) => row.map((key) => ({ ...key, variants: key.variants.filter((v) => !onKeys.has(v)) }));
  return [clean(first), clean(second), clean(third)];
}
