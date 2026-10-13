// Bulgarian, BDS (БДС 5237:2006, the standard layout, "БДС").
// The standard itself is sold by the Bulgarian Institute for Standardization and was not read
// directly. Source: xkeyboard-config, symbols/bg, variant "bds", which its author (Anton Zinoviev,
// who took part in drafting the standard) describes as compliant with BDS 5237:2006
// (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/bg):
//   AD: , у е и ш щ к с д з ц ;   AC: ь я а о ж г т н в м ч „   AB: (ѝ) ю й ъ э ф х п р л б
// Verified against that one source only.
// Mobile adaptation: the punctuation keys on AD01, AD12 and BKSL move to the ?123 layer; ѝ (LSGT)
// is the long-press variant of и; ы (level 3 of AC01) the long-press variant of ь. The letter rows
// keep their desktop order and row membership.

import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const variants = { и: ['ѝ'], ь: ['ы'] };

export const bgBds: Layout = {
  id: 'bg-bds',
  language: 'bg',
  code: 'БГ',
  nativeName: 'Български',
  englishName: 'Bulgarian',
  layoutName: 'БДС',
  rows: letterRows(keys('уеишщксдзц', variants), keys('ьяаожгтнвмч', variants), keys('юйъэфхпрлб', variants)),
  bottom: standardBottomRow,
};
