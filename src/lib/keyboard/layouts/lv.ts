// Latvian, QWERTY.
// Source: xkeyboard-config, symbols/lv, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/lv): a US QWERTY with
// ā č ē ģ ī ķ ļ ņ š ū ž on AltGr. Phone adaptation: those are the first long-press variants.
// Verified against the source above.

import { accentsFirst } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const accents = accentsFirst({ a: ['ā'], c: ['č'], e: ['ē'], g: ['ģ'], i: ['ī'], k: ['ķ'], l: ['ļ'], n: ['ņ'], s: ['š'], u: ['ū'], z: ['ž'] });

export const lv: Layout = {
  id: 'lv',
  language: 'lv',
  code: 'LV',
  nativeName: 'Latviešu',
  englishName: 'Latvian',
  layoutName: 'QWERTY',
  rows: letterRows(keys('qwertyuiop', accents), keys('asdfghjkl', accents), keys('zxcvbnm', accents)),
  bottom: standardBottomRow,
};
