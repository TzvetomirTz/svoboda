import { graphemeBoundaries, graphemes, nextBoundary, previousBoundary, snapToBoundary } from '@/lib/keyboard/graphemes';

describe('graphemes', () => {
  it.each([
    ['empty', '', []],
    ['ascii', 'abc', ['a', 'b', 'c']],
    ['precomposed accent', 'čá', ['č', 'á']],
    ['combining acute', 'éx', ['é', 'x']],
    ['several combining marks', 'ä́b', ['ä́', 'b']],
    ['Cyrillic with combining grave', 'ѝ и', ['ѝ', ' ', 'и']],
    ['Bulgarian ѝ precomposed', 'ѝа', ['ѝ', 'а']],
    ['CRLF', 'a\r\nb', ['a', '\r\n', 'b']],
    ['surrogate pair', '𝒜b', ['𝒜', 'b']],
    ['emoji with skin tone', '👍🏽!', ['👍🏽', '!']],
    ['ZWJ family', '👨‍👩‍👧‍👦x', ['👨‍👩‍👧‍👦', 'x']],
    ['emoji with variation selector', '❤️a', ['❤️', 'a']],
    ['flag pair', '🇧🇬🇺🇦', ['🇧🇬', '🇺🇦']],
    ['odd regional indicators', '🇧🇬🇺', ['🇧🇬', '🇺']],
    ['keycap', '1️⃣2', ['1️⃣', '2']],
    ['tag sequence flag', '🏴󠁧󠁢󠁳󠁣󠁴󠁿a', ['🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'a']],
    ['Hangul jamo', '각가', ['각', '가']],
    ['ZWJ not after pictograph', 'a‍b', ['a‍', 'b']],
    ['newline then combining mark', '\ń', ['\n', '́']],
  ])('%s', (_name, text, expected) => {
    expect(graphemes(text)).toEqual(expected);
  });

  it('boundaries start at 0 and end at the length', () => {
    expect(graphemeBoundaries('')).toEqual([0]);
    expect(graphemeBoundaries('a👍🏽')).toEqual([0, 1, 5]);
  });

  it('finds neighbouring boundaries', () => {
    const text = 'a👍🏽b';
    expect(previousBoundary(text, 5)).toBe(1);
    expect(previousBoundary(text, 1)).toBe(0);
    expect(previousBoundary(text, 0)).toBe(0);
    expect(nextBoundary(text, 1)).toBe(5);
    expect(nextBoundary(text, 6)).toBe(6);
  });

  it('snaps an index inside a cluster back to its start', () => {
    const text = 'a👍🏽b';
    expect(snapToBoundary(text, 3)).toBe(1);
    expect(snapToBoundary(text, 5)).toBe(5);
    expect(snapToBoundary(text, 99)).toBe(6);
    expect(snapToBoundary(text, -4)).toBe(0);
  });
});
