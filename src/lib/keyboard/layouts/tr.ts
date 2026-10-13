// Turkish, Q layout.
// Source: xkeyboard-config, symbols/tr, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/tr):
//   AD: q w e r t y u ı o p ğ ü   AC: a s d f g h j k l ş i   AB: z x c v b n m ö ç
// Shift follows Turkish casing: i → İ and ı → I. Verified against the source above.

import { latinAccents } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const shiftOverrides = { i: 'İ', 'ı': 'I' };

export const tr: Layout = {
  id: 'tr',
  language: 'tr',
  code: 'TR',
  nativeName: 'Türkçe',
  englishName: 'Turkish',
  layoutName: 'Q',
  rows: letterRows(keys('qwertyuıopğü', latinAccents, shiftOverrides), keys('asdfghjklşi', latinAccents, shiftOverrides), keys('zxcvbnmöç', latinAccents, shiftOverrides)),
  bottom: standardBottomRow,
  shiftOverrides,
};
