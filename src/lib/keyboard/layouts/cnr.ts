// Montenegrin, Latin QWERTZ.
// Source: xkeyboard-config, symbols/me, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/me):
//   AD: q w e r t z u i o p š đ   AC: a s d f g h j k l č ć  BKSL: ž   AB: y x c v b n m
// Phone adaptation: ž (BKSL) ends the middle row; the Montenegrin letters ś and ź (AltGr on the
// desktop) are the first long-press variants of s and z. Montenegrin has no ISO 639-1 code, so the
// language is the ISO 639-3 'cnr'. Montenegrin Cyrillic (с́ з́) is not included yet.
// Verified against the source above.

import { accentsFirst } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const accents = accentsFirst({ s: ['ś'], z: ['ź'] });

export const cnr: Layout = {
  id: 'cnr',
  language: 'cnr',
  code: 'CG',
  nativeName: 'Crnogorski',
  englishName: 'Montenegrin',
  layoutName: 'Latinica',
  rows: letterRows(keys('qwertzuiopšđ', accents), keys('asdfghjklčćž', accents), keys('yxcvbnm', accents)),
  bottom: standardBottomRow,
};
