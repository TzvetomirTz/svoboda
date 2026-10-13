// Estonian, QWERTY.
// Source: xkeyboard-config, symbols/ee, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/ee):
//   AD: q w e r t y u i o p ü õ   AC: a s d f g h j k l ö ä   AB: z x c v b n m
// Phone adaptation: š and ž (dead caron on the desktop) are long-press variants.
// Verified against the source above.

import { accentsFirst } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const accents = accentsFirst({ s: ['š'], z: ['ž'] });

export const et: Layout = {
  id: 'et',
  language: 'et',
  code: 'ET',
  nativeName: 'Eesti',
  englishName: 'Estonian',
  layoutName: 'QWERTY',
  rows: letterRows(keys('qwertyuiopüõ', accents), keys('asdfghjklöä', accents), keys('zxcvbnm', accents)),
  bottom: standardBottomRow,
};
