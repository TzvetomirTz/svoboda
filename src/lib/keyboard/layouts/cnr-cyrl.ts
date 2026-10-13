// Montenegrin, Cyrillic.
// Source: xkeyboard-config, symbols/me, variant "cyrillic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/me),
// which is the Serbian Cyrillic layout (include "rs(basic)"); see sr-cyrl.ts for its rows and for
// why ж ends the middle row and the Z key is left out.
// Montenegrin adds с́ and з́ to the Serbian Cyrillic alphabet. Neither source puts them on a key, and
// Unicode has no single code point for them, so they are long-press variants of с and з typed as
// the letter plus a combining acute (U+0301). UNVERIFIED: that placement is ours, not from a
// standard layout.

import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const accents = { с: ['с́'], з: ['з́'] };

export const cnrCyrl: Layout = {
  id: 'cnr-cyrl',
  language: 'cnr',
  code: 'ЦГ',
  nativeName: 'Црногорски',
  englishName: 'Montenegrin',
  layoutName: 'Ћирилица',
  rows: letterRows(keys('љњертзуиопшђ', accents), keys('асдфгхјклчћж', accents), keys('џцвбнм', accents)),
  bottom: standardBottomRow,
};
