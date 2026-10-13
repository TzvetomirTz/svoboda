// German, QWERTZ.
// Source: xkeyboard-config, symbols/de, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/de):
// ü on AD11, ö on AC10, ä on AC11, y and z swapped against QWERTY.
// Mobile adaptation: ß sits on the number row of the desktop layout (AE11), which a phone keyboard
// doesn't have, so it is the first long-press variant of s. Verified against the source above.

import { accentsFirst } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const accents = accentsFirst({ s: ['ß'] });

export const de: Layout = {
  id: 'de',
  language: 'de',
  code: 'DE',
  nativeName: 'Deutsch',
  englishName: 'German',
  layoutName: 'QWERTZ',
  rows: letterRows(keys('qwertzuiopü', accents), keys('asdfghjklöä', accents), keys('yxcvbnm', accents)),
  bottom: standardBottomRow,
};
