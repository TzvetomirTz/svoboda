import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckIcon, ChevronRightIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { fonts, layout, typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import type { Layout } from '@/lib/keyboard/layouts';

export type PickerAnchor = { x: number; y: number; width: number };

const WIDTH = 262;
const HEADER_HEIGHT = 40;
const ROW_HEIGHT = 52;
const POINTER = 12;
const GAP = 8;
const EDGE = 8;

/** Height of the picker for `count` languages, borders included. */
function pickerHeight(count: number) {
  return 2 * layout.rule + HEADER_HEIGHT + ROW_HEIGHT * (count + 1);
}

/**
 * The language list that opens when the language key is held: anchored 8px above the key, with a
 * pointer to it. Tapping outside closes it.
 */
export function LanguagePicker({
  anchor,
  layouts,
  currentId,
  onChoose,
  onManage,
  onClose,
}: {
  anchor: PickerAnchor | null;
  layouts: Layout[];
  currentId: string;
  onChoose: (id: string) => void;
  onManage: () => void;
  onClose: () => void;
}) {
  const colors = useColors();
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  if (!anchor) return null;

  // With many languages the list scrolls rather than run off the top of the screen.
  const height = Math.min(pickerHeight(layouts.length), anchor.y - GAP - insets.top - EDGE);
  const keyCenter = anchor.x + anchor.width / 2;
  const left = Math.max(EDGE, Math.min(anchor.x - EDGE, windowWidth - WIDTH - EDGE));
  const top = anchor.y - GAP - height;

  return (
    <Modal visible transparent statusBarTranslucent navigationBarTranslucent animationType="none" onRequestClose={onClose}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close language list"
      />
      <View
        accessibilityViewIsModal
        style={[styles.box, { left, top, height, backgroundColor: colors.paper, borderColor: colors.ink }]}>
        <View style={[styles.header, { borderBottomColor: colors.line }]}>
          <Text style={[typography.label, { color: colors.muted }]} accessibilityRole="header">
            Your languages · {layouts.length}
          </Text>
        </View>
        <ScrollView style={styles.list} bounces={false}>
          {layouts.map((item) => {
            const current = item.id === currentId;
            return (
              <Pressable
                key={item.id}
                onPress={() => onChoose(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`${item.nativeName}, ${item.englishName} ${item.layoutName}`}
                accessibilityState={{ selected: current }}
                style={({ pressed }) => [
                  styles.row,
                  { borderBottomColor: colors.line },
                  pressed && { backgroundColor: colors.surface },
                ]}>
                <View style={styles.names}>
                  <Text style={[styles.name, { color: colors.ink, fontWeight: current ? '600' : '400' }]} numberOfLines={1}>
                    {item.nativeName}
                  </Text>
                  <Text style={[styles.tag, { color: colors.muted }]} numberOfLines={1}>
                    {item.layoutName}
                  </Text>
                </View>
                {current && <CheckIcon color={colors.ink} size={18} strokeWidth={2.4} />}
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable
          onPress={onManage}
          accessibilityRole="button"
          accessibilityLabel="Manage languages"
          style={({ pressed }) => [styles.row, styles.last, pressed && { backgroundColor: colors.surface }]}>
          <Text style={[styles.manage, { color: colors.ink }]}>Manage languages</Text>
          <ChevronRightIcon color={colors.ink} size={18} />
        </Pressable>
        <View
          style={[
            styles.pointer,
            { left: keyCenter - left - layout.rule - POINTER / 2, backgroundColor: colors.paper, borderColor: colors.ink },
          ]}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    width: WIDTH,
    borderWidth: layout.rule,
  },
  list: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: layout.hairline,
  },
  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    borderBottomWidth: layout.hairline,
  },
  last: {
    borderBottomWidth: 0,
  },
  names: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  name: {
    fontSize: 16,
  },
  tag: {
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  manage: {
    fontSize: 15,
    fontWeight: '600',
  },
  // A rotated square whose lower half pokes out of the box, borders only on the outside edges.
  pointer: {
    position: 'absolute',
    bottom: -POINTER / 2 - layout.rule / 2,
    width: POINTER,
    height: POINTER,
    borderRightWidth: layout.rule,
    borderBottomWidth: layout.rule,
    transform: [{ rotate: '45deg' }],
  },
});
