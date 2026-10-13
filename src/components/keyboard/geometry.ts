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

