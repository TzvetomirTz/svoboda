// Shift, caps lock and auto-capitalisation for the Svoboda keyboard.
// One tap on shift: the next letter is uppercase. Two taps in quick succession: caps lock.
// The first letter of the message and the first after ". ", "! " or "? " are capitalised for you,
// unless you turn shift off for that position.

export type ShiftMode = 'off' | 'once' | 'locked';

export type ShiftState = {
  mode: ShiftMode;
  /** When shift was last tapped, for double-tap detection. */
  lastTapAt: number;
  /** Buffer revision at which the user turned off auto-capitalisation. */
  autoDismissedAt: number | null;
};

export const DOUBLE_TAP_MS = 300;

export const initialShift: ShiftState = { mode: 'off', lastTapAt: -Infinity, autoDismissedAt: null };

/** Whether the next letter typed at the end of `before` should be uppercase on its own. */
export function shouldAutoCapitalize(before: string): boolean {
  return before.trim().length === 0 || /[.!?]\s+$/u.test(before);
}

/** What shift shows and does now, with auto-capitalisation applied. */
export function effectiveShift(state: ShiftState, autoCapitalize: boolean, revision: number): ShiftMode {
  if (state.mode !== 'off') return state.mode;
  return autoCapitalize && state.autoDismissedAt !== revision ? 'once' : 'off';
}

export function pressShift(
  state: ShiftState,
  now: number,
  autoCapitalize: boolean,
  revision: number,
): ShiftState {
  const shown = effectiveShift(state, autoCapitalize, revision);
  const doubleTap = now - state.lastTapAt <= DOUBLE_TAP_MS;

  if (shown === 'locked') return { mode: 'off', lastTapAt: -Infinity, autoDismissedAt: revision };
  // The first tap either turned shift on, or turned off the shift auto-capitalisation turned on.
  if (doubleTap && (state.mode === 'once' || state.autoDismissedAt === revision)) {
    return { mode: 'locked', lastTapAt: -Infinity, autoDismissedAt: null };
  }
  if (shown === 'once') {
    // Turning off shift that auto-capitalisation turned on remembers it for this position.
    return { mode: 'off', lastTapAt: now, autoDismissedAt: state.mode === 'off' ? revision : state.autoDismissedAt };
  }
  return { ...state, mode: 'once', lastTapAt: now };
}

/** After a character is typed: a one-shot shift is used up, caps lock stays. */
export function afterCharacter(state: ShiftState): ShiftState {
  return state.mode === 'once' ? { ...state, mode: 'off' } : state;
}

/**
 * Uppercase of a single character, without turning ß into "SS". Locale-independent on purpose:
 * on a Turkish phone toLocaleUpperCase would turn every i into İ. Layouts that need locale casing
 * (Turkish) say so in `shiftOverrides`.
 */
export function toUpper(character: string): string {
  if (character === 'ß') return 'ẞ';
  const upper = character.toUpperCase();
  return upper.length === character.length ? upper : character;
}
