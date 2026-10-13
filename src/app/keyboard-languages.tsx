import { Pressable, ScrollView, StyleSheet, View, type AccessibilityActionEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { ScreenTitle } from '@/components/screen-title';
import { Text } from '@/components/text';
import { NavBar } from '@/components/top-bar';
import { fonts, layout, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { moveLanguage, toggleLanguage } from '@/lib/keyboard/languages';
import { layoutById, layouts, type Layout } from '@/lib/keyboard/layouts';
import { updateKeyboardPreferences, useKeyboardPreferences } from '@/lib/keyboard/preferences';

export default function KeyboardLanguages() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { enabled } = useKeyboardPreferences();
  const enabledLayouts = enabled.map(layoutById).filter((l): l is Layout => l !== undefined);
  const others = layouts
    .filter((l) => !enabled.includes(l.id))
    .sort((a, b) => a.englishName.localeCompare(b.englishName) || a.layoutName.localeCompare(b.layoutName));

  const toggle = (id: string) => updateKeyboardPreferences(({ enabled }) => ({ enabled: toggleLanguage(enabled, id) }));
  const move = (id: string, direction: -1 | 1) =>
    updateKeyboardPreferences(({ enabled }) => ({ enabled: moveLanguage(enabled, id, direction) }));

  return (
    <Screen>
      <NavBar kind="back" label="Svoboda keyboard" />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing[8] + insets.bottom }}>
        <ScreenTitle>Languages</ScreenTitle>
        <Text style={[styles.intro, { color: colors.muted }]}>
          Tap the language key to cycle through yours. Hold it to pick one.
        </Text>

        <View style={styles.section}>
          <Text style={[typography.label, styles.sectionLabel, { color: colors.muted }]} accessibilityRole="header">
            In your keyboard · {enabledLayouts.length}
          </Text>
          <View style={{ borderTopColor: colors.line, borderTopWidth: layout.hairline }}>
            {enabledLayouts.map((item, index) => (
              <LanguageRow
                key={item.id}
                item={item}
                checked
                onlyOne={enabledLayouts.length === 1}
                position={{ index, count: enabledLayouts.length }}
                onToggle={() => toggle(item.id)}
                onMove={(direction) => move(item.id, direction)}
              />
            ))}
          </View>
        </View>

        {others.length > 0 && (
          <View style={styles.section}>
            <Text style={[typography.label, styles.sectionLabel, { color: colors.muted }]} accessibilityRole="header">
              Add a language
            </Text>
            <View style={{ borderTopColor: colors.line, borderTopWidth: layout.hairline }}>
              {others.map((item) => (
                <LanguageRow key={item.id} item={item} checked={false} onToggle={() => toggle(item.id)} />
              ))}
            </View>
          </View>
        )}

        <Text style={[styles.footer, { color: colors.muted }]}>
          Hold any letter for accents (á č ß ø ł). Works in every Latin layout, so most other European languages are
          covered.
        </Text>
      </ScrollView>
    </Screen>
  );
}

function LanguageRow({
  item,
  checked,
  onlyOne = false,
  position,
  onToggle,
  onMove,
}: {
  item: Layout;
  checked: boolean;
  onlyOne?: boolean;
  position?: { index: number; count: number };
  onToggle: () => void;
  onMove?: (direction: -1 | 1) => void;
}) {
  const colors = useColors();
  const canMoveUp = !!position && position.index > 0;
  const canMoveDown = !!position && position.index < position.count - 1;
  const name = `${item.nativeName}, ${item.englishName} ${item.layoutName}`;

  const actions = [
    ...(canMoveUp ? [{ name: 'moveUp', label: 'Move up' }] : []),
    ...(canMoveDown ? [{ name: 'moveDown', label: 'Move down' }] : []),
  ];

  return (
    <View style={[styles.row, { borderBottomColor: colors.line }]}>
      <Pressable
        onPress={onToggle}
        disabled={onlyOne}
        accessibilityRole="checkbox"
        accessibilityLabel={name}
        accessibilityState={{ checked, disabled: onlyOne }}
        accessibilityHint={onlyOne ? 'At least one language stays in your keyboard' : undefined}
        accessibilityActions={actions}
        onAccessibilityAction={(e: AccessibilityActionEvent) =>
          onMove?.(e.nativeEvent.actionName === 'moveUp' ? -1 : 1)
        }
        style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}>
        <View style={styles.checkTarget}>
          <View style={[styles.check, { borderColor: colors.ink }, checked && { backgroundColor: colors.ink }]}>
            {checked && <CheckIcon color={colors.paper} size={14} />}
          </View>
        </View>
        <View style={styles.names}>
          <Text style={[styles.native, { color: colors.ink }]}>{item.nativeName}</Text>
          <Text style={[styles.detail, { color: colors.muted }]}>
            {item.englishName} · {item.layoutName}
          </Text>
        </View>
      </Pressable>
      {position && (
        <View style={styles.moves}>
          <MoveButton
            label={`Move ${item.englishName} ${item.layoutName} up`}
            disabled={!canMoveUp}
            onPress={() => onMove?.(-1)}
            icon="up"
          />
          <MoveButton
            label={`Move ${item.englishName} ${item.layoutName} down`}
            disabled={!canMoveDown}
            onPress={() => onMove?.(1)}
            icon="down"
          />
        </View>
      )}
    </View>
  );
}

function MoveButton({
  label,
  disabled,
  onPress,
  icon,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
  icon: 'up' | 'down';
}) {
  const colors = useColors();
  const Icon = icon === 'up' ? ChevronUpIcon : ChevronDownIcon;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.move, pressed && styles.pressed, disabled && styles.dimmed]}>
      <Icon color={colors.ink} size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...typography.small,
    marginTop: spacing[4],
    paddingHorizontal: layout.margin,
  },
  section: {
    paddingTop: spacing[8],
    paddingHorizontal: layout.margin,
  },
  sectionLabel: {
    marginBottom: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    borderBottomWidth: layout.hairline,
  },
  toggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  checkTarget: {
    width: 44,
    height: 44,
    marginLeft: -11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 22,
    height: 22,
    borderWidth: layout.rule,
    alignItems: 'center',
    justifyContent: 'center',
  },
  names: {
    flexShrink: 1,
    gap: 2,
  },
  native: {
    fontSize: 17,
    fontWeight: '600',
  },
  detail: {
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  moves: {
    flexDirection: 'row',
  },
  move: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  dimmed: {
    opacity: 0.3,
  },
  footer: {
    ...typography.small,
    marginTop: spacing[8],
    paddingHorizontal: layout.margin,
  },
});
