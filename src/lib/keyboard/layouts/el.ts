// Greek, the standard Greek layout.
// Source: xkeyboard-config, symbols/gr, variant "basic" (https://gitlab.freedesktop.org/xkeyboard-config/xkeyboard-config/-/blob/master/symbols/gr):
//   AD: ; ς ε ρ τ υ θ ι ο π   AC: α σ δ φ γ η ξ κ λ (dead acute)   AB: ζ χ ψ ω β ν μ
// Phone adaptation: ';' (the Greek question mark) moves to the ?123 layer; the accent dead key is
// replaced by long-press variants (ά έ ή ί ϊ ΐ ό ύ ϋ ΰ ώ). Verified against the source above.

import { keys, letterRows, standardBottomRow, type Layout } from '@/lib/keyboard/layouts/types';

const accents = { 'α': ['ά'], 'ε': ['έ'], 'η': ['ή'], 'ι': ['ί', 'ϊ', 'ΐ'], 'ο': ['ό'], 'υ': ['ύ', 'ϋ', 'ΰ'], 'ω': ['ώ'] };

export const el: Layout = {
  id: 'el',
  language: 'el',
  code: 'ΕΛ',
  nativeName: 'Ελληνικά',
  englishName: 'Greek',
  layoutName: 'ΣΕΡΤΥ',
  rows: letterRows(keys('ςερτυθιοπ', accents), keys('ασδφγηξκλ', accents), keys('ζχψωβνμ', accents)),
  bottom: standardBottomRow,
};
