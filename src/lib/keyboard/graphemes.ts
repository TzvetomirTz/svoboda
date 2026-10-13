// Grapheme cluster boundaries, so editing never splits a letter from its accent or an emoji from
// its modifiers. Hermes in our RN version has no Intl.Segmenter, so this is a compact version of
// the extended grapheme cluster rules from Unicode UAX #29 (GB3–GB13). Prepend characters and the
// Indic conjunct rule (GB9c) are left out: no layout we ship produces them.

type Kind =
  | 'CR'
  | 'LF'
  | 'Control'
  | 'Extend'
  | 'ZWJ'
  | 'RI'
  | 'SpacingMark'
  | 'L'
  | 'V'
  | 'T'
  | 'LV'
  | 'LVT'
  | 'Pictographic'
  | 'Other';

const EXTEND = /^[\p{Grapheme_Extend}\p{Emoji_Modifier}]$/u;
const SPACING_MARK = /^\p{Mc}$/u;
const CONTROL = /^[\p{Cc}\p{Zl}\p{Zp}\p{Cf}]$/u;
const PICTOGRAPHIC = /^\p{Extended_Pictographic}$/u;

function kindOf(cp: number): Kind {
  if (cp === 0x0d) return 'CR';
  if (cp === 0x0a) return 'LF';
  if (cp === 0x200d) return 'ZWJ';
  if (cp >= 0x1f1e6 && cp <= 0x1f1ff) return 'RI';
  if ((cp >= 0x1100 && cp <= 0x115f) || (cp >= 0xa960 && cp <= 0xa97c)) return 'L';
  if ((cp >= 0x1160 && cp <= 0x11a7) || (cp >= 0xd7b0 && cp <= 0xd7c6)) return 'V';
  if ((cp >= 0x11a8 && cp <= 0x11ff) || (cp >= 0xd7cb && cp <= 0xd7fb)) return 'T';
  if (cp >= 0xac00 && cp <= 0xd7a3) return (cp - 0xac00) % 28 === 0 ? 'LV' : 'LVT';
  if (cp < 0x80) return cp < 0x20 || cp === 0x7f ? 'Control' : 'Other';
  const ch = String.fromCodePoint(cp);
  // Grapheme_Extend includes ZWNJ and the emoji tag characters, which are Cf; test it first.
  if (EXTEND.test(ch)) return 'Extend';
  if (CONTROL.test(ch)) return 'Control';
  if (SPACING_MARK.test(ch)) return 'SpacingMark';
  if (PICTOGRAPHIC.test(ch)) return 'Pictographic';
  return 'Other';
}

/**
 * Every grapheme cluster boundary in `text`, as UTF-16 offsets, starting with 0 and ending with
 * `text.length`.
 */
export function graphemeBoundaries(text: string): number[] {
  const boundaries = [0];
  if (text.length === 0) return boundaries;

  let prev: Kind | null = null;
  // GB11: inside "Pictographic Extend* ZWJ" so a following pictograph joins the cluster.
  let pictographicRun = false;
  let pictographicZwj = false;
  // GB12/13: number of regional indicators in the current run.
  let riCount = 0;

  let i = 0;
  while (i < text.length) {
    const cp = text.codePointAt(i)!;
    const kind = kindOf(cp);

    if (prev !== null && isBreak(prev, kind, pictographicZwj, riCount)) {
      boundaries.push(i);
    }

    pictographicZwj = pictographicRun && kind === 'ZWJ';
    if (kind === 'Pictographic') pictographicRun = true;
    else if (kind !== 'Extend') pictographicRun = false;
    riCount = kind === 'RI' ? riCount + 1 : 0;

    prev = kind;
    i += cp > 0xffff ? 2 : 1;
  }

  boundaries.push(text.length);
  return boundaries;
}

function isBreak(prev: Kind, next: Kind, pictographicZwj: boolean, riCount: number): boolean {
  if (prev === 'CR' && next === 'LF') return false; // GB3
  if (prev === 'CR' || prev === 'LF' || prev === 'Control') return true; // GB4
  if (next === 'CR' || next === 'LF' || next === 'Control') return true; // GB5
  if (prev === 'L' && (next === 'L' || next === 'V' || next === 'LV' || next === 'LVT')) return false; // GB6
  if ((prev === 'LV' || prev === 'V') && (next === 'V' || next === 'T')) return false; // GB7
  if ((prev === 'LVT' || prev === 'T') && next === 'T') return false; // GB8
  if (next === 'Extend' || next === 'ZWJ') return false; // GB9
  if (next === 'SpacingMark') return false; // GB9a
  if (pictographicZwj && next === 'Pictographic') return false; // GB11
  if (prev === 'RI' && next === 'RI') return riCount % 2 === 0; // GB12, GB13
  return true; // GB999
}

/** The last boundary strictly before `index`, or 0. */
export function previousBoundary(text: string, index: number): number {
  const boundaries = graphemeBoundaries(text);
  let result = 0;
  for (const b of boundaries) {
    if (b >= index) break;
    result = b;
  }
  return result;
}

/** The first boundary strictly after `index`, or `text.length`. */
export function nextBoundary(text: string, index: number): number {
  for (const b of graphemeBoundaries(text)) {
    if (b > index) return b;
  }
  return text.length;
}

/** `index` moved back to the nearest boundary at or before it, so it never sits inside a cluster. */
export function snapToBoundary(text: string, index: number): number {
  const clamped = Math.max(0, Math.min(index, text.length));
  let result = 0;
  for (const b of graphemeBoundaries(text)) {
    if (b > clamped) break;
    result = b;
  }
  return result;
}

/** `text` split into grapheme clusters. */
export function graphemes(text: string): string[] {
  const boundaries = graphemeBoundaries(text);
  const result: string[] = [];
  for (let i = 1; i < boundaries.length; i++) result.push(text.slice(boundaries[i - 1], boundaries[i]));
  return result;
}
