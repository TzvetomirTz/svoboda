// Albanian, QWERTZ.
// Source: xkeyboard-config, symbols/al, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/al):
//   AD: q w e r t z u i o p ç @   AC: a s d f g h j k l ë [   AB: y x c v b n m
// Phone adaptation: the @ and [ keys move to the ?123 layer. Verified against the source above.

import { latinAccents } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

export const sq: Layout = {
  id: 'sq',
  language: 'sq',
  code: 'SQ',
  nativeName: 'Shqip',
  englishName: 'Albanian',
  layoutName: 'QWERTZ',
  rows: letterRows(keys('qwertzuiopç', latinAccents), keys('asdfghjklë', latinAccents), keys('yxcvbnm', latinAccents)),
  bottom: standardBottomRow,
};
