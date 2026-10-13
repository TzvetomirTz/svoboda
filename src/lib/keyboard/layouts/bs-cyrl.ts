// Bosnian, Cyrillic.
// xkeyboard-config has no Bosnian Cyrillic layout. Source: Windows "Bosnian (Cyrillic)", kbdbhc
// (https://kbdlayout.info/kbdbhc), read through kbdlayout.info's key table:
//   Q row: љ њ е р т з у и о п ш ђ   A row: а с д ф г х ј к л ч ћ  \: ж   Z row: ѕ џ ц в б н м
// That is the Windows Serbian (Cyrillic) layout, and the Bosnian and Serbian Cyrillic alphabets are
// the same 30 letters. As for Serbian, ж ends the middle row and the Z key (ѕ, not a Bosnian
// letter) is left out. Verified against that one source only.

import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

export const bsCyrl: Layout = {
  id: 'bs-cyrl',
  language: 'bs',
  code: 'БС',
  nativeName: 'Босански',
  englishName: 'Bosnian',
  layoutName: 'Ћирилица',
  rows: letterRows(keys('љњертзуиопшђ'), keys('асдфгхјклчћж'), keys('џцвбнм')),
  bottom: standardBottomRow,
};
