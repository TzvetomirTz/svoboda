// Sizes of the Svoboda keyboard grid, from the visual spec.

export const KEYBOARD = {
  topBarHeight: 44,
  keyHeight: 46,
  keyGap: 6,
  rowGap: 10,
  sidePadding: 4,
  topPadding: 8,
  bottomPadding: 30,
  /** Shift and delete are this many letter keys wide. */
  wideKey: 1.45,
  keyRadius: 4,
} as const;

/** Flex ratios of the bottom row: ?123, language (or return), space, Encrypt. */
export const BOTTOM_ROW_FLEX = [1.45, 1.2, 5, 2.3] as const;

/**
 * Width of one letter key, the same in every row so letters line up. The widest row (counting
 * shift and delete as 1.45 keys each) decides it; shorter rows are centred.
 */
export function letterKeyWidth(width: number, rowLengths: [number, number, number]): number {
  const inner = width - 2 * KEYBOARD.sidePadding;
  const rows = [
    { units: rowLengths[0], keys: rowLengths[0] },
    { units: rowLengths[1], keys: rowLengths[1] },
    { units: rowLengths[2] + 2 * KEYBOARD.wideKey, keys: rowLengths[2] + 2 },
  ];
  return Math.min(...rows.map(({ units, keys }) => (inner - (keys - 1) * KEYBOARD.keyGap) / units));
}


/** Where a key is drawn in its row: left edge and width. */
export type Frame = { x: number; width: number };

/** How far a key's touch area reaches past its drawn edges. */
export type HitArea = { left: number; right: number; top: number; bottom: number };

/** Keys of the given widths, spaced by the key gap and centred in the row. */
export function centeredRow(width: number, widths: number[]): Frame[] {
  const total = widths.reduce((sum, w) => sum + w, 0) + (widths.length - 1) * KEYBOARD.keyGap;
  let x = (width - total) / 2;
  return widths.map((w) => {
    const frame = { x, width: w };
    x += w + KEYBOARD.keyGap;
    return frame;
  });
}

/** Row 3: shift (or the symbols page key) and delete at the edges, letters centred between. */
export function thirdRow(width: number, wideWidth: number, letterWidths: number[]): Frame[] {
  const inner = wideWidth + KEYBOARD.keyGap;
  const middle = width - 2 * (KEYBOARD.sidePadding + inner);
  const letters = centeredRow(middle, letterWidths).map((f) => ({ ...f, x: f.x + KEYBOARD.sidePadding + inner }));
  return [
    { x: KEYBOARD.sidePadding, width: wideWidth },
    ...letters,
    { x: width - KEYBOARD.sidePadding - wideWidth, width: wideWidth },
  ];
}

/** The bottom row, split by `BOTTOM_ROW_FLEX`. */
export function bottomRow(width: number): Frame[] {
  const inner = width - 2 * KEYBOARD.sidePadding - (BOTTOM_ROW_FLEX.length - 1) * KEYBOARD.keyGap;
  const total = BOTTOM_ROW_FLEX.reduce((a, b) => a + b, 0);
  let x = KEYBOARD.sidePadding;
  return BOTTOM_ROW_FLEX.map((flex) => {
    const frame = { x, width: (inner * flex) / total };
    x += frame.width + KEYBOARD.keyGap;
    return frame;
  });
}

/**
 * Touch areas that leave no dead space: the space between two keys is split evenly between them,
 * the outermost keys reach the keyboard's edges, the top row reaches up into the top padding and
 * the bottom row down into the bottom padding. Keys still look the same; only where a tap lands
 * changes.
 */
export function hitAreas(frames: Frame[], width: number, row: number, rowCount: number): HitArea[] {
  const top = row === 0 ? KEYBOARD.topPadding : KEYBOARD.rowGap / 2;
  const bottom = row === rowCount - 1 ? KEYBOARD.bottomPadding : KEYBOARD.rowGap / 2;
  return frames.map((frame, i) => {
    const previous = frames[i - 1];
    const next = frames[i + 1];
    const right = frame.x + frame.width;
    return {
      left: previous ? (frame.x - (previous.x + previous.width)) / 2 : frame.x,
      right: next ? (next.x - right) / 2 : width - right,
      top,
      bottom,
    };
  });
}
