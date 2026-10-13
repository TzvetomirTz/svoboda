// Slovenian, QWERTZ (the same letter keys as Croatian).
// Source: xkeyboard-config, symbols/si, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/si):
//   AD: q w e r t z u i o p š đ   AC: a s d f g h j k l č ć  BKSL: ž   AB: y x c v b n m
// Phone adaptation: ž (BKSL) ends the middle row. Verified against the source above.

import { latinAccents } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

export const sl: Layout = {
  id: 'sl',
  language: 'sl',
  code: 'SL',
  nativeName: 'Slovenščina',
  englishName: 'Slovenian',
  layoutName: 'QWERTZ',
  rows: letterRows(keys('qwertzuiopšđ', latinAccents), keys('asdfghjklčćž', latinAccents), keys('yxcvbnm', latinAccents)),
  bottom: standardBottomRow,
};
