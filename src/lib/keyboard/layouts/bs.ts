// Bosnian, Latin QWERTZ (the same letter keys as Croatian).
// Source: xkeyboard-config, symbols/ba, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/ba):
//   AD: q w e r t z u i o p š đ   AC: a s d f g h j k l č ć  BKSL: ž   AB: y x c v b n m
// Phone adaptation: ž (BKSL) ends the middle row. Bosnian in Cyrillic can use the Serbian Cyrillic
// layout. Verified against the source above.

import { latinAccents } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

export const bs: Layout = {
  id: 'bs',
  language: 'bs',
  code: 'BS',
  nativeName: 'Bosanski',
  englishName: 'Bosnian',
  layoutName: 'Latinica',
  rows: letterRows(keys('qwertzuiopšđ', latinAccents), keys('asdfghjklčćž', latinAccents), keys('yxcvbnm', latinAccents)),
  bottom: standardBottomRow,
};
