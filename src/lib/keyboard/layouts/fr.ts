// French, AZERTY.
// Source: xkeyboard-config, symbols/fr, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/fr):
// a z on AD01–02, q on AC01, m on AC10, w on AB01.
// Mobile adaptation: the desktop row 3 continues with , ; : ! after n, and é è ç à ù sit on the
// number row. On the phone the punctuation is on the ?123 layer, and the accented letters are
// long-press variants (e → é è ê ë, a → à â, c → ç, u → ù û). Verified against the source above.

import { accentsFirst } from '@/lib/keyboard/layouts/latin-accents';
import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const accents = accentsFirst({ a: ['à', 'â', 'æ'], e: ['é', 'è', 'ê', 'ë'], u: ['ù', 'û', 'ü'], o: ['ô', 'œ'], i: ['î', 'ï'] });

export const fr: Layout = {
  id: 'fr',
  language: 'fr',
  code: 'FR',
  nativeName: 'Français',
  englishName: 'French',
  layoutName: 'AZERTY',
  rows: letterRows(keys('azertyuiop', accents), keys('qsdfghjklm', accents), keys('wxcvbn', accents)),
  bottom: standardBottomRow,
};
