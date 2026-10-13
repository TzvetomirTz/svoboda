// Spanish, QWERTY (Spain).
// Source: xkeyboard-config, symbols/es, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/es): ñ on AC10.
// Mobile adaptation: the dead accent keys (AC11, AD11) and ç (BKSL) have no place on a phone
// keyboard; á é í ó ú ü ç are long-press variants. Verified against the source above.

import { accentsFirst } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const accents = accentsFirst({ a: ['á'], e: ['é'], i: ['í'], o: ['ó'], u: ['ú', 'ü'], c: ['ç'] });

export const es: Layout = {
  id: 'es',
  language: 'es',
  code: 'ES',
  nativeName: 'Español',
  englishName: 'Spanish',
  layoutName: 'QWERTY',
  rows: letterRows(keys('qwertyuiop', accents), keys('asdfghjklñ', accents), keys('zxcvbnm', accents)),
  bottom: standardBottomRow,
};
