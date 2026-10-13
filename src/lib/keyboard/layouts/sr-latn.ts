// Serbian, Latin QWERTZ.
// Source: xkeyboard-config, symbols/rs, variant "latin" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/rs):
//   AD: q w e r t z u i o p š đ   AC: a s d f g h j k l č ć  BKSL: ž   AB: y x c v b n m
// Phone adaptation: ž (BKSL) ends the middle row. Verified against the source above.

import { latinAccents } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

export const srLatn: Layout = {
  id: 'sr-latn',
  language: 'sr',
  code: 'SR',
  nativeName: 'Srpski',
  englishName: 'Serbian',
  layoutName: 'Latinica',
  rows: letterRows(keys('qwertzuiopšđ', latinAccents), keys('asdfghjklčćž', latinAccents), keys('yxcvbnm', latinAccents)),
  bottom: standardBottomRow,
};
