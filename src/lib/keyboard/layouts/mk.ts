// Macedonian, Cyrillic.
// Source: xkeyboard-config, symbols/mk, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/mk):
//   AD: љ њ е р т ѕ у и о п ш ѓ   AC: а с д ф г х ј к л ч ќ  BKSL: ж   AB: з џ ц в б н м
// Phone adaptation: ж (BKSL) ends the middle row; ѐ and ѝ, written to tell homographs apart, are
// long-press variants of е and и. All 31 letters have a key. Verified against the source above.

import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const accents = { 'е': ['ѐ'], 'и': ['ѝ'] };

export const mk: Layout = {
  id: 'mk',
  language: 'mk',
  code: 'МК',
  nativeName: 'Македонски',
  englishName: 'Macedonian',
  layoutName: 'Кирилица',
  rows: letterRows(keys('љњертѕуиопшѓ', accents), keys('асдфгхјклчќж', accents), keys('зџцвбнм', accents)),
  bottom: standardBottomRow,
};
