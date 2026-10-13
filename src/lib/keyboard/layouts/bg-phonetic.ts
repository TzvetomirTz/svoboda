// Bulgarian, phonetic: the NEW phonetic layout of БДС 5237:2006 (not the older "traditional"
// phonetic layout, where я is on Q and ж on V).
// The standard itself was not read directly. Source: xkeyboard-config, symbols/bg, variant
// "bas_phonetic", described there as "the Bulgarian phonetic keyboard according to the proposed
// state standard BDS 5237:2006" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/bg):
//   TLDE: ю
//   AD: ч ш е р т ъ у и о п я щ   AC: а с д ф г х й к л ; '  BKSL: ь   AB: з ж ц в б н м , . /
// Verified against that one source only.
// Mobile adaptation: ю (number row) and ь (BKSL) end the middle row in place of the ; ' keys;
// punctuation moves to the ?123 layer; ѝ is the long-press variant of и.

import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const variants = { и: ['ѝ'], ь: ['ы'] };

export const bgPhonetic: Layout = {
  id: 'bg-phonetic',
  language: 'bg',
  code: 'БГ',
  nativeName: 'Български',
  englishName: 'Bulgarian',
  layoutName: 'Фонетична',
  rows: letterRows(keys('чшертъуиопящ', variants), keys('асдфгхйклюь', variants), keys('зжцвбнм', variants)),
  bottom: standardBottomRow,
};
