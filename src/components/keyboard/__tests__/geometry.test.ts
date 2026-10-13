import {
  bottomRow,
  centeredRow,
  hitAreas,
  KEYBOARD,
  letterKeyWidth,
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
  const unit = letterKeyWidth(WIDTH, [10, 9, 7]);

  it('centres row 2 of English under row 1 with about 19px each side', () => {
    const row2 = centeredRow(WIDTH, Array(9).fill(unit));
    expect(row2[0].x).toBeCloseTo(19.4 + KEYBOARD.sidePadding, 0);
  });

  it.each([
    ['row 1', centeredRow(WIDTH, Array(10).fill(unit)), 0],
    ['row 2 (inset)', centeredRow(WIDTH, Array(9).fill(unit)), 1],
    ['row 3', thirdRow(WIDTH, unit * KEYBOARD.wideKey, Array(7).fill(unit)), 2],
    ['bottom row', bottomRow(WIDTH), 3],
  ])('%s: touch areas cover the whole width with no gaps or overlaps', (_name, frames, row) => {
    const s = spans(frames, row);
    expect(s[0].from).toBeCloseTo(0);
    expect(s[s.length - 1].to).toBeCloseTo(WIDTH);
    for (let i = 1; i < s.length; i++) expect(s[i].from).toBeCloseTo(s[i - 1].to);
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
    const wide = unit * KEYBOARD.wideKey;
    const frames = thirdRow(WIDTH, wide, Array(7).fill(unit));
    expect(frames[0].x).toBe(KEYBOARD.sidePadding);
    expect(frames[8].x + frames[8].width).toBeCloseTo(WIDTH - KEYBOARD.sidePadding);
    const leftSpace = frames[1].x - (frames[0].x + wide);
    const rightSpace = frames[8].x - (frames[7].x + unit);
    expect(leftSpace).toBeCloseTo(rightSpace);
  });
});
