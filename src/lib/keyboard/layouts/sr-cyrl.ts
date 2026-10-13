// Serbian, Cyrillic.
// Sources:
// - xkeyboard-config, symbols/rs, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/rs):
//     AD: љ њ е р т з у и о п ш ђ   AC: а с д ф г х ј к л ч ћ  BKSL: ж   AB: ж џ ц в б н м
// - Windows "Serbian (Cyrillic)", kbdycc (https://kbdlayout.info/kbdycc): the same, except Z is ѕ.
// The sources agree on ж at BKSL (next to the middle row on ISO keyboards) and disagree on Z
// (xkb repeats ж, Windows has ѕ, which isn't a Serbian letter). The phone layout puts ж at the end
// of the middle row and leaves Z out. All 30 letters of the Serbian Cyrillic alphabet have a key.

import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

export const srCyrl: Layout = {
  id: 'sr-cyrl',
  language: 'sr',
  code: 'СР',
  nativeName: 'Српски',
  englishName: 'Serbian',
  layoutName: 'Ћирилица',
  rows: letterRows(keys('љњертзуиопшђ'), keys('асдфгхјклчћж'), keys('џцвбнм')),
  bottom: standardBottomRow,
};
