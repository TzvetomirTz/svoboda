// Romanian, standard QWERTY (SR 13392:2004, with comma-below ș ț).
// Source: xkeyboard-config, symbols/ro, variant "std" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/ro):
//   AD: q w e r t y u i o p ă î   AC: a s d f g h j k l ș ț  BKSL: â   AB: z x c v b n m
// Phone adaptation: â (BKSL, next to the middle row on ISO keyboards) ends the middle row.
// Verified against the source above.

import { latinAccents } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

export const ro: Layout = {
  id: 'ro',
  language: 'ro',
  code: 'RO',
  nativeName: 'Română',
  englishName: 'Romanian',
  layoutName: 'QWERTY',
  rows: letterRows(keys('qwertyuiopăî', latinAccents), keys('asdfghjklșțâ', latinAccents), keys('zxcvbnm', latinAccents)),
  bottom: standardBottomRow,
};
