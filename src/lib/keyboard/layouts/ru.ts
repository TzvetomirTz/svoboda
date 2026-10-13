// Russian, ЙЦУКЕН.
// Source: xkeyboard-config, symbols/ru, "common" section used by the default variant (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/ru):
//   AD: й ц у к е н г ш щ з х ъ   AC: ф ы в а п р о л д ж э   AB: я ч с м и т ь б ю
// Mobile adaptation: ё sits on the number row (TLDE) on the desktop, so it is the long-press variant
// of е. All 12 keys of the top row are kept. Verified against the source above.

import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const variants = { е: ['ё'], ь: ['ъ'] };

export const ru: Layout = {
  id: 'ru',
  language: 'ru',
  code: 'RU',
  nativeName: 'Русский',
  englishName: 'Russian',
  layoutName: 'ЙЦУКЕН',
  rows: letterRows(keys('йцукенгшщзхъ', variants), keys('фывапролджэ', variants), keys('ячсмитьбю', variants)),
  bottom: standardBottomRow,
};
