import {
  clearBuffer,
  deleteBackward,
  emptyBuffer,
  insertText,
  moveCursor,
  replaceSelection,
  replaceText,
  setCursor,
  textBeforeCursor,
  type MessageBuffer,
} from '@/lib/keyboard/buffer';

function buffer(text: string, start: number, end = start): MessageBuffer {
  return { text, selection: { start, end }, revision: 0 };
}

describe('message buffer', () => {
  it('inserts at the cursor and moves it after the insert', () => {
    const next = insertText(buffer('helo', 3), 'l');
    expect(next.text).toBe('hello');
    expect(next.selection).toEqual({ start: 4, end: 4 });
    expect(next.revision).toBe(1);
  });

  it('inserts into an empty buffer', () => {
    expect(insertText(emptyBuffer, 'Ж').text).toBe('Ж');
  });

  it('replaces a selection, in either direction', () => {
    expect(insertText(buffer('hello world', 6, 11), 'there').text).toBe('hello there');
    const reversed = insertText(buffer('hello world', 11, 6), 'you');
    expect(reversed.text).toBe('hello you');
    expect(reversed.selection).toEqual({ start: 9, end: 9 });
  });

  it('deletes one character before the cursor', () => {
    const next = deleteBackward(buffer('abc', 2));
    expect(next.text).toBe('ac');
    expect(next.selection).toEqual({ start: 1, end: 1 });
  });

  it('does nothing at the start', () => {
    const start = buffer('abc', 0);
    expect(deleteBackward(start)).toBe(start);
  });

  it('deletes a selection', () => {
    expect(deleteBackward(buffer('abcdef', 1, 4)).text).toBe('aef');
  });

  it.each([
    ['combining accent', 'aé', 'a'],
    ['Cyrillic with combining grave', 'бѝ', 'б'],
    ['emoji with skin tone', 'hi👍🏽', 'hi'],
    ['ZWJ family', 'x👨‍👩‍👧', 'x'],
    ['flag', 'BG🇧🇬', 'BG'],
    ['astral letter', 'a𝒜', 'a'],
    ['CRLF', 'a\r\n', 'a'],
  ])('deletes a whole grapheme cluster: %s', (_name, text, expected) => {
    expect(deleteBackward(buffer(text, text.length)).text).toBe(expected);
  });

  it('deletes a cluster in the middle of the text', () => {
    const next = deleteBackward(buffer('a👍🏽b', 5));
    expect(next.text).toBe('ab');
    expect(next.selection.start).toBe(1);
  });

  it('snaps the cursor out of a cluster', () => {
    expect(setCursor(buffer('a👍🏽b', 0), 3).selection).toEqual({ start: 1, end: 1 });
    expect(setCursor(buffer('abc', 0), 10).selection).toEqual({ start: 3, end: 3 });
  });

  it('keeps the same buffer when the cursor does not move', () => {
    const b = buffer('abc', 2);
    expect(setCursor(b, 2)).toBe(b);
  });

  it('moves by grapheme cluster', () => {
    const b = buffer('a👍🏽b', 1);
    expect(moveCursor(b, 1).selection.start).toBe(5);
    expect(moveCursor(b, -1).selection.start).toBe(0);
    expect(moveCursor(buffer('ab', 0), -1).selection.start).toBe(0);
    expect(moveCursor(buffer('abcd', 1, 3), -1).selection).toEqual({ start: 1, end: 1 });
    expect(moveCursor(buffer('abcd', 1, 3), 1).selection).toEqual({ start: 3, end: 3 });
  });

  it('takes edits and selections from the system keyboard', () => {
    const typed = replaceText(buffer('ab', 2), 'abc');
    expect(typed.text).toBe('abc');
    expect(replaceText(typed, 'abc')).toBe(typed);
    const selected = replaceSelection(typed, { start: 0, end: 99 });
    expect(selected.selection).toEqual({ start: 0, end: 3 });
  });

  it('clears to an empty buffer with a new revision', () => {
    const cleared = clearBuffer(buffer('secret', 6));
    expect(cleared.text).toBe('');
    expect(cleared.selection).toEqual({ start: 0, end: 0 });
    expect(cleared.revision).toBe(1);
  });

  it('gives the text before the cursor', () => {
    expect(textBeforeCursor(buffer('Hello. world', 7))).toBe('Hello. ');
  });
});
