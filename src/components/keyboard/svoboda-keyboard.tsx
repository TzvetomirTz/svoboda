import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View, type AccessibilityActionEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronDownIcon, DeleteIcon, ReturnIcon, ShiftIcon } from '@/components/icons';
import {
  bottomRow,
  centeredRow,
  hitAreas,
  KEYBOARD,
  letterKeyWidth,
  thirdRow,
  type HitArea,
} from '@/components/keyboard/geometry';
import { Key, KEY_LABEL_MAX_SCALE } from '@/components/keyboard/key';
import { LanguagePicker, type PickerAnchor } from '@/components/keyboard/language-picker';
import { Text } from '@/components/text';
import { layout as themeLayout, typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { nextLanguage } from '@/lib/keyboard/languages';
import type { Layout, LetterKey } from '@/lib/keyboard/layouts';
import { afterCharacter, effectiveShift, initialShift, pressShift, toUpper, type ShiftMode } from '@/lib/keyboard/shift';
import { symbolPages, symbolVariants } from '@/lib/keyboard/symbols';
import { SecureInputView } from '../../../modules/svoboda-secure';

// The Svoboda keyboard: an on-screen keyboard drawn by the app itself, so what you type never
// passes through a keyboard app. It types exactly what was pressed: no prediction, no autocorrect,
// no learning. It can't hide input from the phone itself; the OS still draws the screen and
// delivers the touches.

type Page = 'letters' | 0 | 1;

type Accent = {
  variants: string[];
  /** Strip position in keyboard coordinates. */
  left: number;
  top: number;
  /** Keyboard origin on the page, to map finger movement onto the strip. */
  originX: number;
  selected: number;
};

const ACCENT_CELL = 36;
const ACCENT_HEIGHT = 44;
const DELETE_REPEAT_DELAY = 400;
const DELETE_REPEAT_START = 100;
const DELETE_REPEAT_FASTEST = 35;

// While an accent strip is open the finger may slide far from the key; keep the press alive.
const ACCENT_RETENTION = { top: 200, bottom: 100, left: 400, right: 400 };

export function SvobodaKeyboard({
  layout,
  enabledLayouts,
  autoCapitalize,
  revision,
  encryptDisabled,
  onInsert,
  onDelete,
  onEncrypt,
  onHide,
  onSwitchLanguage,
  onManageLanguages,
}: {
  layout: Layout;
  enabledLayouts: Layout[];
  /** Whether the text before the cursor calls for a capital letter. */
  autoCapitalize: boolean;
  /** The message buffer's revision, so auto-capitalisation resets after every edit. */
  revision: number;
  encryptDisabled: boolean;
  onInsert: (text: string) => void;
  onDelete: () => void;
  onEncrypt: () => void;
  onHide: () => void;
  onSwitchLanguage: (id: string) => void;
  onManageLanguages: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [width, setWidth] = useState(windowWidth);
  const [page, setPage] = useState<Page>('letters');
  const [shift, setShift] = useState(initialShift);
  const [accent, setAccent] = useState<Accent | null>(null);
  const [picker, setPicker] = useState<PickerAnchor | null>(null);
  const containerRef = useRef<View>(null);
  const languageKeyRef = useRef<View>(null);
  // Whether a letter is still held after its long press, so a late measurement doesn't open a strip.
  const accentHeld = useRef(false);
  const deleteRepeat = useRef<{ timer: ReturnType<typeof setTimeout> | null; repeated: boolean }>({
    timer: null,
    repeated: false,
  });

  useEffect(() => () => stopDeleteRepeat(), []);

  const shown: ShiftMode = effectiveShift(shift, autoCapitalize, revision);
  const upper = shown !== 'off';

  const rows: LetterKey[][] =
    page === 'letters'
      ? layout.rows
      : symbolPages[page].map((row) => row.map((base) => ({ base, shift: base, variants: symbolVariants[base] ?? [] })));
  const unit = letterKeyWidth(width, [rows[0].length, rows[1].length, rows[2].length]);
  const wideWidth = unit * KEYBOARD.wideKey;

  // Where each key is drawn, and the touch area around it that fills the gaps.
  const frames = [
    centeredRow(width, rows[0].map(() => unit)),
    centeredRow(width, rows[1].map(() => unit)),
    thirdRow(width, wideWidth, rows[2].map(() => unit)),
    bottomRow(width),
  ];
  const hits = frames.map((row, index) => hitAreas(row, width, index, frames.length));

  function typeKey(key: LetterKey, variant?: string) {
    const character = variant ?? key.base;
    if (page === 'letters') {
      onInsert(upper ? (variant ? toUpper(variant) : key.shift) : character);
      setShift(afterCharacter);
    } else {
      onInsert(character);
    }
  }

  // Delete: one cluster per tap; held, it repeats after a short delay and then speeds up.
  function startDeleteRepeat() {
    stopDeleteRepeat();
    deleteRepeat.current.repeated = false;
    let interval = DELETE_REPEAT_START;
    const step = () => {
      deleteRepeat.current.repeated = true;
      onDelete();
      interval = Math.max(DELETE_REPEAT_FASTEST, interval * 0.85);
      deleteRepeat.current.timer = setTimeout(step, interval);
    };
    deleteRepeat.current.timer = setTimeout(step, DELETE_REPEAT_DELAY);
  }

  function stopDeleteRepeat() {
    if (deleteRepeat.current.timer) clearTimeout(deleteRepeat.current.timer);
    deleteRepeat.current.timer = null;
  }

  function openAccents(view: View | null, key: LetterKey) {
    const container = containerRef.current;
    if (!view || !container || key.variants.length === 0) return;
    accentHeld.current = true;
    container.measure((_x, _y, _w, _h, originX) => {
      view.measureLayout(container, (x, y, keyWidth) => {
        const stripWidth = key.variants.length * ACCENT_CELL + 2 * themeLayout.rule;
        const left = Math.max(
          KEYBOARD.sidePadding,
          Math.min(x + keyWidth / 2 - ACCENT_CELL / 2 - themeLayout.rule, width - KEYBOARD.sidePadding - stripWidth),
        );
        if (!accentHeld.current) return;
        setAccent({ variants: key.variants, left, top: y - ACCENT_HEIGHT - 4, originX, selected: 0 });
      });
    });
  }

  function moveAccent(pageX: number) {
    if (!accent) return;
    const index = Math.floor((pageX - accent.originX - accent.left - themeLayout.rule) / ACCENT_CELL);
    const selected = Math.max(0, Math.min(accent.variants.length - 1, index));
    if (selected !== accent.selected) setAccent({ ...accent, selected });
  }

  function releaseAccent(key: LetterKey) {
    accentHeld.current = false;
    if (!accent) return;
    typeKey(key, accent.variants[accent.selected]);
    setAccent(null);
  }

  function openPicker() {
    languageKeyRef.current?.measureInWindow((x, y, keyWidth) => setPicker({ x, y, width: keyWidth }));
  }

  function chooseLanguage(id: string) {
    setPicker(null);
    onSwitchLanguage(id);
  }

  function letterKey(key: LetterKey, index: number, hit: HitArea) {
    return (
      <LetterKeyButton
        key={`${key.base}-${index}`}
        letter={key}
        label={page === 'letters' && upper ? key.shift : key.base}
        upper={page === 'letters' && upper}
        width={unit}
        hit={hit}
        onType={(variant) => typeKey(key, variant)}
        onLongPress={(view) => openAccents(view, key)}
        onRelease={() => releaseAccent(key)}
      />
    );
  }

  const shiftLabel = shown === 'locked' ? 'Caps lock on' : shown === 'once' ? 'Shift on' : 'Shift';
  const languageLabel = `Language: ${layout.englishName}${enabledLayouts.filter((l) => l.language === layout.language).length > 1 ? ` ${layout.layoutName}` : ''}. Tap to switch, hold to choose`;

  return (
    <SecureInputView>
      <View
        ref={containerRef}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onTouchMove={(e) => moveAccent(e.nativeEvent.pageX)}
        accessibilityLabel="Svoboda keyboard"
        style={[
          styles.keyboard,
          { backgroundColor: colors.paper, borderTopColor: colors.ink, paddingBottom: insets.bottom },
        ]}>
        <View style={styles.topBar}>
          <View style={styles.status}>
            <View style={[styles.signal, { backgroundColor: colors.signal }]} />
            <Text style={[typography.label, { color: colors.ink }]} maxFontSizeMultiplier={KEY_LABEL_MAX_SCALE} numberOfLines={1}>
              Svoboda keyboard · {layout.englishName}
            </Text>
          </View>
          <Pressable
            onPress={onHide}
            accessibilityRole="button"
            accessibilityLabel="Hide Svoboda keyboard"
            style={({ pressed }) => [styles.hide, pressed && { opacity: 0.6 }]}>
            <ChevronDownIcon color={colors.ink} />
          </Pressable>
        </View>

        <View>
          <View style={styles.row}>{rows[0].map((key, i) => letterKey(key, i, hits[0][i]))}</View>
          <View style={styles.row}>{rows[1].map((key, i) => letterKey(key, i, hits[1][i]))}</View>
          <View style={styles.row}>
            {page === 'letters' ? (
              <Key
                accessibilityLabel={shiftLabel}
                accessibilityHint="Double-tap quickly for caps lock"
                accessibilityActions={[{ name: 'capsLock', label: shown === 'locked' ? 'Caps lock off' : 'Caps lock' }]}
                onAccessibilityAction={() =>
                  setShift(shown === 'locked' ? { ...initialShift, autoDismissedAt: revision } : { ...initialShift, mode: 'locked' })
                }
                selected={upper}
                tone={upper ? 'active' : 'plain'}
                onPress={() => setShift((s) => pressShift(s, Date.now(), autoCapitalize, revision))}
                width={wideWidth}
                hit={hits[2][0]}>
                {(color) => <ShiftIcon color={color} filled={shown === 'locked'} />}
              </Key>
            ) : (
              <Key
                label={page === 0 ? '#+=' : '123'}
                accessibilityLabel={page === 0 ? 'More symbols' : 'Numbers and symbols'}
                onPress={() => setPage(page === 0 ? 1 : 0)}
                labelStyle={styles.functionLabel}
                width={wideWidth}
                hit={hits[2][0]}
              />
            )}
            {rows[2].map((key, i) => letterKey(key, i, hits[2][i + 1]))}
            <Key
              accessibilityLabel="Delete"
              onPressIn={startDeleteRepeat}
              onPressOut={stopDeleteRepeat}
              onPress={() => {
                // A held key already deleted while repeating. Screen readers activate with onPress alone.
                if (!deleteRepeat.current.repeated) onDelete();
                deleteRepeat.current.repeated = false;
              }}
              width={wideWidth}
              hit={hits[2][rows[2].length + 1]}>
              {(color) => <DeleteIcon color={color} />}
            </Key>
          </View>

          <View style={styles.row}>
            <Key
              label={page === 'letters' ? '?123' : 'ABC'}
              accessibilityLabel={page === 'letters' ? 'Numbers and symbols' : 'Letters'}
              onPress={() => setPage(page === 'letters' ? 0 : 'letters')}
              labelStyle={styles.functionLabel}
              width={frames[3][0].width}
              hit={hits[3][0]}
            />
            {page === 'letters' ? (
              <Key
                ref={languageKeyRef}
                accessibilityLabel={languageLabel}
                accessibilityActions={[{ name: 'choose', label: 'Choose language' }]}
                onAccessibilityAction={(e: AccessibilityActionEvent) => {
                  if (e.nativeEvent.actionName === 'choose') openPicker();
                }}
                onPress={() => onSwitchLanguage(nextLanguage(enabledLayouts.map((l) => l.id), layout.id))}
                onLongPress={openPicker}
                tone={picker ? 'active' : 'plain'}
                selected={picker !== null}
                width={frames[3][1].width}
                hit={hits[3][1]}>
                {(color) => (
                  <>
                    <Text style={[styles.functionLabel, { color }]} maxFontSizeMultiplier={KEY_LABEL_MAX_SCALE}>
                      {layout.code}
                    </Text>
                    <View style={[styles.holdHint, { backgroundColor: color }]} />
                  </>
                )}
              </Key>
            ) : (
              <Key accessibilityLabel="Return" onPress={() => onInsert('\n')} width={frames[3][1].width} hit={hits[3][1]}>
                {(color) => <ReturnIcon color={color} />}
              </Key>
            )}
            <Key
              label="space"
              accessibilityLabel="Space"
              onPress={() => onInsert(' ')}
              labelStyle={[styles.spaceLabel, { color: colors.muted }]}
              width={frames[3][2].width}
              hit={hits[3][2]}
            />
            <Key
              label="Encrypt"
              accessibilityLabel="Encrypt"
              accessibilityHint="Encrypts for the selected person, signs, and copies to the clipboard"
              tone="ink"
              disabled={encryptDisabled}
              onPress={onEncrypt}
              labelStyle={styles.functionLabel}
              width={frames[3][3].width}
              hit={hits[3][3]}
            />
          </View>
        </View>

        {accent && (
          <View
            pointerEvents="box-none"
            style={[
              styles.accents,
              { left: accent.left, top: accent.top, backgroundColor: colors.paper, borderColor: colors.ink },
            ]}>
            {accent.variants.map((variant, index) => {
              const selected = index === accent.selected;
              const character = page === 'letters' && upper ? toUpper(variant) : variant;
              return (
                <View
                  key={variant}
                  accessibilityRole="keyboardkey"
                  accessibilityLabel={character}
                  accessibilityState={{ selected }}
                  style={[styles.accent, selected && { backgroundColor: colors.ink }]}>
                  <Text style={[styles.accentLabel, { color: selected ? colors.paper : colors.ink }]} maxFontSizeMultiplier={KEY_LABEL_MAX_SCALE}>
                    {character}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <LanguagePicker
        anchor={picker}
        layouts={enabledLayouts}
        currentId={layout.id}
        onChoose={chooseLanguage}
        onManage={() => {
          setPicker(null);
          onManageLanguages();
        }}
        onClose={() => setPicker(null)}
      />
    </SecureInputView>
  );
}

/**
 * A letter or symbol key. Tap types it. Hold opens the accent strip above it; slide to choose and
 * release to type. Screen reader users get the variants as accessibility actions instead.
 */
function LetterKeyButton({
  letter,
  label,
  upper,
  width,
  hit,
  onType,
  onLongPress,
  onRelease,
}: {
  letter: LetterKey;
  label: string;
  upper: boolean;
  width: number;
  hit: HitArea;
  onType: (variant?: string) => void;
  onLongPress: (view: View | null) => void;
  onRelease: () => void;
}) {
  const ref = useRef<View>(null);
  const hasVariants = letter.variants.length > 0;
  const variants = upper ? letter.variants.map(toUpper) : letter.variants;

  return (
    <Key
      ref={ref}
      label={label}
      accessibilityLabel={label}
      accessibilityActions={variants.map((variant, index) => ({ name: `variant-${index}`, label: variant }))}
      onAccessibilityAction={(e) => {
        const index = Number(e.nativeEvent.actionName.replace('variant-', ''));
        if (Number.isInteger(index) && letter.variants[index]) onType(letter.variants[index]);
      }}
      onPress={() => onType()}
      onLongPress={hasVariants ? () => onLongPress(ref.current) : undefined}
      onPressOut={onRelease}
      pressRetentionOffset={hasVariants ? ACCENT_RETENTION : undefined}
      width={width}
      hit={hit}
    />
  );
}

const styles = StyleSheet.create({
  keyboard: {
    borderTopWidth: themeLayout.rule,
  },
  topBar: {
    height: KEYBOARD.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 8,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  signal: {
    width: 8,
    height: 8,
  },
  hide: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Touch cells fill each row edge to edge; the gaps are drawn inside them.
  row: {
    flexDirection: 'row',
  },
  functionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  spaceLabel: {
    fontSize: 14,
  },
  holdHint: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 5,
    height: 5,
  },
  accents: {
    position: 'absolute',
    flexDirection: 'row',
    height: ACCENT_HEIGHT,
    borderWidth: themeLayout.rule,
  },
  accent: {
    width: ACCENT_CELL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentLabel: {
    fontSize: 20,
  },
});
