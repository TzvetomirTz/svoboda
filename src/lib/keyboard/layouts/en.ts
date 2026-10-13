// English, US QWERTY.
// Source: xkeyboard-config, symbols/us, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/us), the ANSI
// US layout. Letter rows only; digits and punctuation live on the ?123 layer.
// Verified against the source above.

import { latinAccents } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

export const en: Layout = {
  id: 'en',
  language: 'en',
  code: 'EN',
  nativeName: 'English',
  englishName: 'English',
  layoutName: 'QWERTY',
  rows: letterRows(keys('qwertyuiop', latinAccents), keys('asdfghjkl', latinAccents), keys('zxcvbnm', latinAccents)),
  bottom: standardBottomRow,
};
