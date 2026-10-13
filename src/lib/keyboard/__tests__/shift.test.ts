import {
  afterCharacter,
  DOUBLE_TAP_MS,
  effectiveShift,
  initialShift,
  pressShift,
  shouldAutoCapitalize,
  toUpper,
} from '@/lib/keyboard/shift';

describe('shift', () => {
  it('one tap capitalises the next letter only', () => {
    const once = pressShift(initialShift, 1000, false, 1);
    expect(effectiveShift(once, false, 1)).toBe('once');
    expect(effectiveShift(afterCharacter(once), false, 2)).toBe('off');
  });

  it('a second tap later turns it off again', () => {
    const once = pressShift(initialShift, 1000, false, 1);
    const off = pressShift(once, 1000 + DOUBLE_TAP_MS + 1, false, 1);
    expect(effectiveShift(off, false, 1)).toBe('off');
  });

  it('a double tap locks caps until shift is tapped again', () => {
    const once = pressShift(initialShift, 1000, false, 1);
    const locked = pressShift(once, 1200, false, 1);
    expect(effectiveShift(locked, false, 1)).toBe('locked');
    expect(effectiveShift(afterCharacter(locked), false, 2)).toBe('locked');
    const off = pressShift(afterCharacter(locked), 5000, false, 2);
    expect(effectiveShift(off, false, 2)).toBe('off');
  });

  it('auto-capitalisation shows shift on, and a tap turns it off for that position only', () => {
    expect(effectiveShift(initialShift, true, 3)).toBe('once');
    const dismissed = pressShift(initialShift, 1000, true, 3);
    expect(effectiveShift(dismissed, true, 3)).toBe('off');
    // After the next edit, a new position gets auto-capitalised again.
    expect(effectiveShift(afterCharacter(dismissed), true, 4)).toBe('once');
  });

  it('a double tap on an auto-capitalised shift locks caps', () => {
    const dismissed = pressShift(initialShift, 1000, true, 3);
    const locked = pressShift(dismissed, 1100, true, 3);
    expect(effectiveShift(locked, true, 3)).toBe('locked');
  });

  it.each([
    ['', true],
    ['   ', true],
    ['Hello. ', true],
    ['Really? ', true],
    ['Wow!  ', true],
    ['Line.\n', true],
    ['Hello.', false],
    ['Hello ', false],
    ['e.g', false],
    ['Hi, ', false],
  ])('auto-capitalises after %j: %s', (before, expected) => {
    expect(shouldAutoCapitalize(before)).toBe(expected);
  });

  it('uppercases single characters', () => {
    expect(toUpper('a')).toBe('A');
    expect(toUpper('ж')).toBe('Ж');
    expect(toUpper('ß')).toBe('ẞ');
    expect(toUpper('ѝ')).toBe('Ѝ');
    expect(toUpper('1')).toBe('1');
  });
});
