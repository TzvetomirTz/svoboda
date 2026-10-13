import { nextBoundary, previousBoundary, snapToBoundary } from '@/lib/keyboard/graphemes';

// The message being written on Send: its text and selection. Both keyboards edit the same buffer,
// so switching between them keeps the text and the cursor. Pure functions, no copies kept.

export type Selection = { start: number; end: number };

export type MessageBuffer = {
  text: string;
  selection: Selection;
  /** Bumped on every change, including cursor moves. Lets UI tell edits apart without the text. */
  revision: number;
};

export const emptyBuffer: MessageBuffer = { text: '', selection: { start: 0, end: 0 }, revision: 0 };

function next(buffer: MessageBuffer, text: string, cursor: number): MessageBuffer {
  return { text, selection: { start: cursor, end: cursor }, revision: buffer.revision + 1 };
}

function ordered({ start, end }: Selection): Selection {
  return start <= end ? { start, end } : { start: end, end: start };
}

/** Replaces the selection (or inserts at the cursor) with `insert`, leaving the cursor after it. */
export function insertText(buffer: MessageBuffer, insert: string): MessageBuffer {
  const { start, end } = ordered(buffer.selection);
  const text = buffer.text.slice(0, start) + insert + buffer.text.slice(end);
  return next(buffer, text, start + insert.length);
}

/** Deletes the selection, or the one grapheme cluster before the cursor. */
export function deleteBackward(buffer: MessageBuffer): MessageBuffer {
  const { start, end } = ordered(buffer.selection);
  if (start !== end) return next(buffer, buffer.text.slice(0, start) + buffer.text.slice(end), start);
  if (start === 0) return buffer;
  const from = previousBoundary(buffer.text, start);
  return next(buffer, buffer.text.slice(0, from) + buffer.text.slice(start), from);
}

/** Puts a collapsed cursor at `index`, snapped back to a grapheme boundary. */
export function setCursor(buffer: MessageBuffer, index: number): MessageBuffer {
  const cursor = snapToBoundary(buffer.text, index);
  if (buffer.selection.start === cursor && buffer.selection.end === cursor) return buffer;
  return next(buffer, buffer.text, cursor);
}

/** Moves a collapsed cursor one grapheme cluster left or right. A selection collapses to its edge. */
export function moveCursor(buffer: MessageBuffer, direction: -1 | 1): MessageBuffer {
  const { start, end } = ordered(buffer.selection);
  if (start !== end) return next(buffer, buffer.text, direction < 0 ? start : end);
  const cursor = direction < 0 ? previousBoundary(buffer.text, start) : nextBoundary(buffer.text, start);
  return setCursor(buffer, cursor);
}

/** The text was edited by the system keyboard. Its selection arrives separately. */
export function replaceText(buffer: MessageBuffer, text: string): MessageBuffer {
  if (text === buffer.text) return buffer;
  const cursor = Math.min(buffer.selection.end, text.length);
  return { text, selection: { start: cursor, end: cursor }, revision: buffer.revision + 1 };
}

/** The system keyboard moved the selection. */
export function replaceSelection(buffer: MessageBuffer, selection: Selection): MessageBuffer {
  const clamp = (i: number) => Math.max(0, Math.min(i, buffer.text.length));
  const next = { start: clamp(selection.start), end: clamp(selection.end) };
  if (next.start === buffer.selection.start && next.end === buffer.selection.end) return buffer;
  return { text: buffer.text, selection: next, revision: buffer.revision + 1 };
}

/** A fresh, empty buffer that still counts as a change. */
export function clearBuffer(buffer: MessageBuffer): MessageBuffer {
  return next(buffer, '', 0);
}

/** The text before the cursor (or selection start). */
export function textBeforeCursor(buffer: MessageBuffer): string {
  return buffer.text.slice(0, ordered(buffer.selection).start);
}
