// Croatian, QWERTZ.
// Source: xkeyboard-config, symbols/hr, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/hr), which includes rs(latin):
//   AD: q w e r t z u i o p š đ   AC: a s d f g h j k l č ć  BKSL: ž   AB: y x c v b n m
// Phone adaptation: ž (BKSL, next to the middle row on ISO keyboards) ends the middle row.
// Verified against the source above.

import { latinAccents } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

export const hr: Layout = {
  id: 'hr',
  language: 'hr',
  code: 'HR',
  nativeName: 'Hrvatski',
  englishName: 'Croatian',
  layoutName: 'QWERTZ',
  rows: letterRows(keys('qwertzuiopšđ', latinAccents), keys('asdfghjklčćž', latinAccents), keys('yxcvbnm', latinAccents)),
  bottom: standardBottomRow,
};
