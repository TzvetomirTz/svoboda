// Polish, QWERTY ("Polish programmer's', the layout in everyday use in Poland).
// Source: xkeyboard-config, symbols/pl, variant 'basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/pl): a US QWERTY with
// ą ć ę ł ń ó ś ź ż on AltGr. Phone adaptation: those letters are the first long-press variants.
// Verified against the source above.

import { accentsFirst } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const accents = accentsFirst({ a: ['ą'], c: ['ć'], e: ['ę'], l: ['ł'], n: ['ń'], o: ['ó'], s: ['ś'], z: ['ż', 'ź'] });

export const pl: Layout = {
  id: 'pl',
  language: 'pl',
  code: 'PL',
  nativeName: 'Polski',
  englishName: 'Polish',
  layoutName: 'QWERTY',
  rows: letterRows(keys('qwertyuiop', accents), keys('asdfghjkl', accents), keys('zxcvbnm', accents)),
  bottom: standardBottomRow,
};
