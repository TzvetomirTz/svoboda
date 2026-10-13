import { useEffect, useRef, useState } from 'react';
import {
  PixelRatio,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type AccessibilityActionEvent,
  type GestureResponderEvent,
  type TextLayoutLine,
  type TextStyle,
} from 'react-native';

import { Text } from '@/components/text';
import { graphemeBoundaries } from '@/lib/keyboard/graphemes';

// The message box while the Svoboda keyboard is open: the message drawn as plain text with our own
// caret, instead of a focused TextInput. No view has focus, so no OS text input session is open:
// no system keyboard, autocorrect, spell checker or input learning sees what is typed.
//
// React Native reports where lines break (onTextLayout) but not where characters sit within a line,
// so x positions come from measuring line prefixes in hidden Text views with the same style. They
// are cached by prefix and pruned to the current text, so deleted text doesn't linger.

type LineSpan = { line: TextLayoutLine; start: number; content: string };
type Caret = { x: number; y: number; height: number };
type Tap = { line: LineSpan; x: number };

/** Measured after a prefix so trailing spaces count; its own width is subtracted. */
const MARKER = '|';
/** Cache key for the marker's own width; can't clash with a prefix of real text. */
const MARKER_KEY = '\u0000marker';

export function MessageView({
  text,
  cursor,
  placeholder,
  textStyle,
  textColor,
  placeholderColor,
  caretColor,
  accessibilityLabel,
  onCursorChange,
  onCursorStep,
}: {
  text: string;
  cursor: number;
  placeholder: string;
  /** Same font, size, line height and letter spacing as the TextInput, so switching never jumps. */
  textStyle: TextStyle;
  textColor: string;
  placeholderColor: string;
  caretColor: string;
  accessibilityLabel: string;
  onCursorChange: (index: number) => void;
  onCursorStep: (direction: -1 | 1) => void;
}) {
  const [layout, setLayout] = useState<{ text: string; lines: TextLayoutLine[] } | null>(null);
  const [widths, setWidths] = useState<Map<string, number>>(() => new Map());
  const [tap, setTap] = useState<Tap | null>(null);
  const [lastCaret, setLastCaret] = useState<Caret | null>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const pending = useRef(new Map<string, number>());

  const spans = layout && layout.text === text ? lineSpans(text, layout.lines) : null;

  // Prefixes whose x position is needed now: the caret's, and every one on a tapped line.
  const needed = new Set<string>();
  const caretSpot = spans ? caretSpan(spans, text, cursor) : null;
  if (caretSpot?.span) needed.add(caretSpot.span.content.slice(0, caretSpot.offset));
  if (tap) for (const b of graphemeBoundaries(tap.line.content)) needed.add(tap.line.content.slice(0, b));
  needed.delete('');
  const missing = [...needed].filter((prefix) => !widths.has(prefix));
  const markerWidth = widths.get(MARKER_KEY);
  const measuring = markerWidth === undefined ? [...missing, ''] : missing;

  function xOf(prefix: string): number | undefined {
    if (prefix === '') return 0;
    const width = widths.get(prefix);
    return width === undefined || markerWidth === undefined ? undefined : width - markerWidth;
  }

  const lineHeight = (textStyle.lineHeight ?? 26) * PixelRatio.getFontScale();
  let caret: Caret | null = null;
  if (text.length === 0) caret = { x: 0, y: 0, height: lineHeight };
  else if (caretSpot && !caretSpot.span) caret = caretSpot.after;
  else if (caretSpot?.span) {
    const x = xOf(caretSpot.span.content.slice(0, caretSpot.offset));
    if (x !== undefined) {
      const { line } = caretSpot.span;
      caret = { x: line.x + x, y: line.y, height: line.height };
    }
  }
  // Remember the last caret that could be placed, to show while a new layout or width is measured.
  if (caret && (caret.x !== lastCaret?.x || caret.y !== lastCaret?.y || caret.height !== lastCaret?.height)) {
    setLastCaret(caret);
  }
  const shownCaret = caret ?? lastCaret;

  // Keep the caret in view.
  useEffect(() => {
    if (!shownCaret || viewportHeight === 0) return;
    const top = scrollY.current;
    if (shownCaret.y < top) scrollRef.current?.scrollTo({ y: shownCaret.y, animated: false });
    else if (shownCaret.y + shownCaret.height > top + viewportHeight) {
      scrollRef.current?.scrollTo({ y: shownCaret.y + shownCaret.height - viewportHeight, animated: false });
    }
  }, [shownCaret, viewportHeight]);

  /** The cursor index nearest to a tap, once every prefix on its line is measured. */
  function resolveTap({ line, x }: Tap, known: Map<string, number>): number | null {
    const marker = known.get(MARKER_KEY);
    if (marker === undefined) return null;
    let best = 0;
    let bestDistance = Infinity;
    for (const b of graphemeBoundaries(line.content)) {
      const width = b === 0 ? marker : known.get(line.content.slice(0, b));
      if (width === undefined) return null;
      const distance = Math.abs(line.line.x + width - marker - x);
      if (distance < bestDistance) {
        best = b;
        bestDistance = distance;
      }
    }
    return line.start + best;
  }

  function recordWidth(prefix: string, lines: TextLayoutLine[]) {
    const key = prefix === '' ? MARKER_KEY : prefix;
    pending.current.set(key, lines.reduce((sum, line) => sum + line.width, 0));
    const done = measuring.every((p) => pending.current.has(p === '' ? MARKER_KEY : p));
    if (!done) return;
    // Keep only prefixes still in the message, so deleted text doesn't linger in the cache.
    const merged = new Map(
      [...widths, ...pending.current].filter(([p]) => p === MARKER_KEY || text.includes(p)),
    );
    pending.current = new Map();
    setWidths(merged);
    if (tap) {
      const index = resolveTap(tap, merged);
      if (index !== null) {
        setTap(null);
        onCursorChange(index);
      }
    }
  }

  function press(event: GestureResponderEvent) {
    const { locationX, locationY } = event.nativeEvent;
    if (!spans || spans.length === 0) {
      onCursorChange(text.length);
      return;
    }
    const last = spans[spans.length - 1];
    if (locationY >= last.line.y + last.line.height) {
      onCursorChange(text.length);
      return;
    }
    const span = spans.find((s) => locationY < s.line.y + s.line.height) ?? last;
    const next = { line: span, x: locationX };
    const index = resolveTap(next, widths);
    if (index === null) setTap(next);
    else onCursorChange(index);
  }

  function accessibilityAction(event: AccessibilityActionEvent) {
    switch (event.nativeEvent.actionName) {
      case 'increment':
        onCursorStep(1);
        break;
      case 'decrement':
        onCursorStep(-1);
        break;
      case 'activate':
        onCursorChange(text.length);
        break;
    }
  }

  return (
    <View
      style={styles.container}
      onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: text.length > 0 ? text : 'Empty' }}
      accessibilityHint="Swipe up or down to move the cursor"
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }, { name: 'activate' }]}
      onAccessibilityAction={accessibilityAction}>
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.flexGrow}
        onScroll={(e) => {
          scrollY.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="always">
        <Pressable onPress={press} style={styles.flexGrow} testID="message-view-text">
          {text.length > 0 ? (
            <Text
              style={[textStyle, { color: textColor }]}
              onTextLayout={(e) => setLayout({ text, lines: e.nativeEvent.lines })}>
              {text}
            </Text>
          ) : (
            <Text style={[textStyle, { color: placeholderColor }]}>{placeholder}</Text>
          )}
          {shownCaret && (
            <View
              testID="message-caret"
              pointerEvents="none"
              style={[
                styles.caret,
                { left: Math.max(0, shownCaret.x - 1), top: shownCaret.y, height: shownCaret.height, backgroundColor: caretColor },
              ]}
            />
          )}
        </Pressable>
      </ScrollView>

      {measuring.length > 0 && (
        <View
          style={styles.measurer}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
          {measuring.map((prefix) => (
            <Text
              key={prefix === '' ? 'marker' : `p:${prefix}`}
              style={textStyle}
              numberOfLines={1}
              onTextLayout={(e) => recordWidth(prefix, e.nativeEvent.lines)}>
              {prefix + MARKER}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * Where each laid-out line starts in `text` and what it holds without its line break.
 * Null if the lines don't add up to the text (a layout for older text, say).
 */
export function lineSpans(text: string, lines: TextLayoutLine[]): LineSpan[] | null {
  const spans: LineSpan[] = [];
  let position = 0;
  for (const line of lines) {
    const content = line.text.replace(/\r?\n$/, '');
    if (text.slice(position, position + content.length) !== content) return null;
    spans.push({ line, start: position, content });
    position += content.length;
    if (text.startsWith('\r\n', position)) position += 2;
    else if (text[position] === '\n') position += 1;
  }
  return position === text.length ? spans : null;
}

/**
 * The line and offset the caret sits at. At a soft line break the caret goes to the start of the
 * next line. After a final line break that has no laid-out line of its own, `after` places it at
 * the start of the empty last line.
 */
export function caretSpan(
  spans: LineSpan[],
  text: string,
  cursor: number,
): { span: LineSpan; offset: number; after?: undefined } | { span: null; offset: 0; after: Caret } | null {
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    const end = span.start + span.content.length;
    const next = spans[i + 1];
    if (cursor < span.start || cursor > end) continue;
    if (cursor === end && next && next.start === end) continue;
    return { span, offset: cursor - span.start };
  }
  const last = spans[spans.length - 1];
  if (last && cursor === text.length && /\n$/.test(text)) {
    return { span: null, offset: 0, after: { x: 0, y: last.line.y + last.line.height, height: last.line.height } };
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  flexGrow: {
    flexGrow: 1,
  },
  caret: {
    position: 'absolute',
    width: 2,
  },
  measurer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 10000,
    opacity: 0,
  },
});
