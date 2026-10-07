import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { CheckIcon, ChevronDownIcon, ContactsIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { fonts, layout, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { formatFingerprint } from '@/lib/fingerprint';
import { useAppState } from '@/state/app-state';

const SCRIM = 'rgba(10, 10, 10, 0.4)';
const ROW_HEIGHT = 56;

/** The underlined To/From field. Opens a list of contacts below itself. */
export function ContactSelect({ label }: { label: 'To' | 'From' }) {
  const colors = useColors();
  const { contacts, selectedContact, selectContact } = useAppState();
  const fieldRef = useRef<View>(null);
  const [menuTop, setMenuTop] = useState<number | null>(null);
  const { height: windowHeight } = useWindowDimensions();

  function open() {
    if (!selectedContact) {
      router.push('/connect/scan');
      return;
    }
    fieldRef.current?.measureInWindow((_x, y, _width, height) => setMenuTop(y + height + 14));
  }

  function choose(id: string) {
    selectContact(id);
    setMenuTop(null);
  }

  function manage() {
    setMenuTop(null);
    router.push('/contacts');
  }

  return (
    <View style={styles.field}>
      <Text style={[typography.label, { color: colors.muted }]}>{label}</Text>
      <Pressable
        ref={fieldRef}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={selectedContact ? `${label} ${selectedContact.name}. Change` : 'Add someone first'}
        style={[styles.select, { borderBottomColor: colors.ink }]}>
        <View style={styles.selected}>
          <Text style={[typography.title, { color: colors.ink }]}>{selectedContact?.name ?? 'Add someone'}</Text>
          <Text style={[styles.fingerprint, { color: colors.muted }]}>
            {selectedContact ? formatFingerprint(selectedContact.fingerprint, 4) : 'No contacts yet'}
          </Text>
        </View>
        <ChevronDownIcon color={colors.ink} />
      </Pressable>

      <Modal
        visible={menuTop !== null}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setMenuTop(null)}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: SCRIM }]} onPress={() => setMenuTop(null)} />
        <View
          accessibilityRole="list"
          accessibilityLabel="Choose contact"
          style={[
            styles.menu,
            { top: menuTop ?? 0, maxHeight: windowHeight - (menuTop ?? 0) - spacing[8] },
            { backgroundColor: colors.paper, borderColor: colors.ink },
          ]}>
          <Text style={[typography.label, styles.menuHeader, { color: colors.muted, borderBottomColor: colors.line }]}>
            Contacts · {contacts.length}
          </Text>
          <ScrollView bounces={false}>
            {contacts.map((contact) => {
              const selected = contact.id === selectedContact?.id;
              return (
                <Pressable
                  key={contact.id}
                  onPress={() => choose(contact.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.option, { borderBottomColor: colors.line }]}>
                  <View style={styles.selected}>
                    <Text style={[styles.optionName, { color: colors.ink, fontWeight: selected ? '600' : '500' }]}>
                      {contact.name}
                    </Text>
                    <Text style={[styles.fingerprint, { color: colors.muted }]}>
                      {formatFingerprint(contact.fingerprint, 2)}
                    </Text>
                  </View>
                  {selected && <CheckIcon color={colors.ink} size={18} strokeWidth={2.4} />}
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable onPress={manage} accessibilityRole="button" style={styles.manage}>
            <ContactsIcon color={colors.ink} size={18} />
            <Text style={[styles.manageLabel, { color: colors.ink }]}>Manage contacts</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing[2],
    paddingTop: layout.margin,
    paddingHorizontal: layout.margin,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 52,
    borderBottomWidth: layout.rule,
  },
  selected: {
    flexShrink: 1,
    gap: 2,
  },
  fingerprint: {
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  menu: {
    position: 'absolute',
    left: layout.margin,
    right: layout.margin,
    borderWidth: layout.rule,
  },
  menuHeader: {
    paddingVertical: 12,
    paddingHorizontal: spacing[4],
    borderBottomWidth: layout.hairline,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: ROW_HEIGHT,
    paddingHorizontal: spacing[4],
    borderBottomWidth: layout.hairline,
  },
  optionName: {
    fontSize: 16,
  },
  manage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    minHeight: 52,
    paddingHorizontal: spacing[4],
  },
  manageLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
