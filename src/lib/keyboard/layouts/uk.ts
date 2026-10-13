// Ukrainian, ЙЦУКЕН.
// Source: xkeyboard-config, symbols/ua, variants "legacy" and "unicode" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/ua):
//   AD: й ц у к е н г ш щ з х ї   AC: ф і в а п р о л д ж є   AB: я ч с м и т ь б ю
//   ґ on BKSL (next to є on ISO keyboards), the apostrophe on TLDE.
// Mobile adaptation: ґ ends the middle row (its ISO position), the apostrophe ends the bottom row.
// Long-press on the apostrophe gives the modifier letter apostrophe ʼ (U+02BC) and ’ (U+2019),
// which Ukrainian orthography also uses. Verified against the source above.

import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const variants = { "'": ['ʼ', '’'], г: ['ґ'] };

export const uk: Layout = {
  id: 'uk',
  language: 'uk',
  code: 'UA',
  nativeName: 'Українська',
  englishName: 'Ukrainian',
  layoutName: 'ЙЦУКЕН',
  rows: letterRows(keys('йцукенгшщзхї', variants), keys('фівапролджєґ', variants), keys("ячсмитьбю'", variants)),
  bottom: standardBottomRow,
};
