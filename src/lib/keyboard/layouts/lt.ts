// Lithuanian, QWERTY.
// Source: xkeyboard-config, symbols/lt, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/lt):
//   AE: ą č ę ė į š ų ū „ “ - ž   then a US QWERTY.
// Phone adaptation: the number-row letters are the first long-press variants of their base letter.
// Verified against the source above.

import { accentsFirst } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const accents = accentsFirst({ a: ['ą'], c: ['č'], e: ['ę', 'ė'], i: ['į'], s: ['š'], u: ['ų', 'ū'], z: ['ž'] });

export const lt: Layout = {
  id: 'lt',
  language: 'lt',
  code: 'LT',
  nativeName: 'Lietuvių',
  englishName: 'Lithuanian',
  layoutName: 'QWERTY',
  rows: letterRows(keys('qwertyuiop', accents), keys('asdfghjkl', accents), keys('zxcvbnm', accents)),
  bottom: standardBottomRow,
};
