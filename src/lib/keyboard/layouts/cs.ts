// Czech, QWERTZ.
// Source: xkeyboard-config, symbols/cz, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/cz):
//   AE: + ě š č ř ž ý á í é   AD: q w e r t z u i o p ú )   AC: a s d f g h j k l ů §   AB: y x c v b n m
// Phone adaptation: the letters on the number row (ě š č ř ž ý á í é) and ď ť ň ó are long-press
// variants; ú and ů keep their keys; the ) and § keys move to the ?123 layer.
// Verified against the source above.

import { accentsFirst } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const accents = accentsFirst({ e: ['ě', 'é'], s: ['š'], c: ['č'], r: ['ř'], z: ['ž'], y: ['ý'], a: ['á'], i: ['í'], d: ['ď'], t: ['ť'], n: ['ň'], o: ['ó'] });

export const cs: Layout = {
  id: 'cs',
  language: 'cs',
  code: 'CS',
  nativeName: 'Čeština',
  englishName: 'Czech',
  layoutName: 'QWERTZ',
  rows: letterRows(keys('qwertzuiopú', accents), keys('asdfghjklů', accents), keys('yxcvbnm', accents)),
  bottom: standardBottomRow,
};
