// Slovak, QWERTZ.
// Source: xkeyboard-config, symbols/sk, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/sk):
//   AE: + ľ š č ť ž ý á í é   AD: q w e r t z u i o p ú ä   AC: a s d f g h j k l ô §  BKSL: ň
//   AB: y x c v b n m
// Phone adaptation: the number-row letters (ľ š č ť ž ý á í é) and ĺ ď ŕ ó are long-press variants;
// ň (BKSL, next to the middle row on ISO keyboards) ends the middle row in place of §.
// Verified against the source above.

import { accentsFirst } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const accents = accentsFirst({ l: ['ľ', 'ĺ'], s: ['š'], c: ['č'], t: ['ť'], z: ['ž'], y: ['ý'], a: ['á'], i: ['í'], e: ['é'], d: ['ď'], r: ['ŕ'], o: ['ó'] });

export const sk: Layout = {
  id: 'sk',
  language: 'sk',
  code: 'SK',
  nativeName: 'Slovenčina',
  englishName: 'Slovak',
  layoutName: 'QWERTZ',
  rows: letterRows(keys('qwertzuiopúä', accents), keys('asdfghjklôň', accents), keys('yxcvbnm', accents)),
  bottom: standardBottomRow,
};
