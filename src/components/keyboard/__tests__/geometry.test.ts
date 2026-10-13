import {
  bottomRow,
  centeredRow,
  hitAreas,
  KEYBOARD,
  keyWidths,
  thirdRow,
  type Frame,
} from '@/components/keyboard/geometry';

const WIDTH = 390;

/** Touch areas laid side by side, as the row renders them. */
function spans(frames: Frame[], row: number) {
  const areas = hitAreas(frames, WIDTH, row, 4);
  return frames.map((f, i) => ({ from: f.x - areas[i].left, to: f.x + f.width + areas[i].right }));
}

describe('keyboard geometry', () => {
  const { unit, wide } = keyWidths(WIDTH, [10, 9, 7]);

  it('centres row 2 of English under row 1 with about 19px each side', () => {
    const row2 = centeredRow(WIDTH, Array(9).fill(unit));
    expect(row2[0].x).toBeCloseTo(19.4 + KEYBOARD.sidePadding, 0);
  });

  it.each([
    ['row 1', centeredRow(WIDTH, Array(10).fill(unit)), 0],
    ['row 2 (inset)', centeredRow(WIDTH, Array(9).fill(unit)), 1],
    ['row 3', thirdRow(WIDTH, wide, Array(7).fill(unit)), 2],
    ['bottom row', bottomRow(WIDTH), 3],
  ])('%s: touch areas cover the whole width with no gaps or overlaps', (_name, frames, row) => {
    const s = spans(frames, row);
    expect(s[0].from).toBeCloseTo(0);
    expect(s[s.length - 1].to).toBeCloseTo(WIDTH);
    for (let i = 1; i < s.length; i++) expect(s[i].from).toBeCloseTo(s[i - 1].to);
  });

  it('keeps shift and delete 1.45 keys wide when row 3 has room (English)', () => {
    expect(wide).toBeCloseTo(unit * KEYBOARD.wideKey);
  });

  it('narrows shift and delete before it narrows the letters (Bulgarian BDS)', () => {
    const bds = keyWidths(WIDTH, [10, 11, 9]);
    // Row 2 (11 letters) decides the letter width; row 3 (9 letters) still fits shift and delete.
    expect(bds.unit).toBeCloseTo((WIDTH - 2 * KEYBOARD.sidePadding - 10 * KEYBOARD.keyGap) / 11);
    expect(bds.wide).toBeCloseTo(bds.unit);
    // Before: э in row 3 and 1.45× shift and delete made every key about 24.5px.
    expect(bds.unit).toBeGreaterThan(29);
  });

  it('only narrows shift and delete as far as row 3 needs, on any phone width', () => {
    for (let width = 320; width <= 440; width += 5) {
      for (const [a, b, c] of [[10, 9, 7], [12, 11, 9], [12, 12, 10], [10, 11, 9], [10, 10, 11], [11, 11, 9]]) {
        const { unit: u, wide: w } = keyWidths(width, [a, b, c]);
        const inner = width - 2 * KEYBOARD.sidePadding;
        const upper = Math.min((inner - (a - 1) * KEYBOARD.keyGap) / a, (inner - (b - 1) * KEYBOARD.keyGap) / b);
        expect(w / u).toBeGreaterThanOrEqual(1 - 1e-9);
        expect(w / u).toBeLessThanOrEqual(KEYBOARD.wideKey + 1e-9);
        const row3 = c * u + 2 * w + (c + 1) * KEYBOARD.keyGap;
        // Narrower than 1.45 only when row 3 is full; letters narrower than rows 1–2 allow only
        // when shift and delete are already letter-sized.
        if (w / u < KEYBOARD.wideKey - 1e-9) expect(row3).toBeCloseTo(inner);
        if (u < upper - 1e-9) expect(w).toBeCloseTo(u);
      }
    }
  });

  it('shrinks letters only once shift and delete are letter-sized', () => {
    const { unit: u, wide: w } = keyWidths(WIDTH, [10, 10, 11]);
    expect(w).toBeCloseTo(u);
    expect(u).toBeCloseTo((WIDTH - 2 * KEYBOARD.sidePadding - 12 * KEYBOARD.keyGap) / 13);
  });

  it('never lets a row overflow the keyboard', () => {
    for (const lengths of [[10, 9, 7], [12, 11, 9], [12, 12, 10], [10, 11, 9], [12, 11, 7], [9, 9, 7]] as const) {
      const { unit: u, wide: w } = keyWidths(WIDTH, [...lengths]);
      const row3 = lengths[2] * u + 2 * w + (lengths[2] + 1) * KEYBOARD.keyGap;
      expect(row3).toBeLessThanOrEqual(WIDTH - 2 * KEYBOARD.sidePadding + 0.001);
      for (const n of lengths.slice(0, 2)) {
        expect(n * u + (n - 1) * KEYBOARD.keyGap).toBeLessThanOrEqual(WIDTH - 2 * KEYBOARD.sidePadding + 0.001);
      }
    }
  });

  it('splits the gap between two keys evenly', () => {
    const frames = centeredRow(WIDTH, Array(10).fill(unit));
    const areas = hitAreas(frames, WIDTH, 1, 4);
    expect(areas[3].right).toBeCloseTo(KEYBOARD.keyGap / 2);
    expect(areas[4].left).toBeCloseTo(KEYBOARD.keyGap / 2);
  });

  it('gives the first and last keys of an inset row the inset', () => {
    const frames = centeredRow(WIDTH, Array(9).fill(unit));
    const areas = hitAreas(frames, WIDTH, 1, 4);
    expect(areas[0].left).toBeCloseTo(frames[0].x);
    expect(areas[8].right).toBeCloseTo(WIDTH - frames[8].x - frames[8].width);
  });

  it('stacks rows with no vertical gaps, reaching the top and bottom padding', () => {
    const frames = centeredRow(WIDTH, [unit]);
    const rows = [0, 1, 2, 3].map((row) => hitAreas(frames, WIDTH, row, 4)[0]);
    expect(rows[0].top).toBe(KEYBOARD.topPadding);
    expect(rows[3].bottom).toBe(KEYBOARD.bottomPadding);
    for (let i = 1; i < 4; i++) expect(rows[i - 1].bottom + rows[i].top).toBe(KEYBOARD.rowGap);
  });

  it('keeps shift and delete at the edges with the letters centred between', () => {
    const frames = thirdRow(WIDTH, wide, Array(7).fill(unit));
    expect(frames[0].x).toBe(KEYBOARD.sidePadding);
    expect(frames[8].x + frames[8].width).toBeCloseTo(WIDTH - KEYBOARD.sidePadding);
    const leftSpace = frames[1].x - (frames[0].x + wide);
    const rightSpace = frames[8].x - (frames[7].x + unit);
    expect(leftSpace).toBeCloseTo(rightSpace);
  });
});
