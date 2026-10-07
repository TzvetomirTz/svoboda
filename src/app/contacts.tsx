import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { Screen } from '@/components/screen';
import { ScreenTitle } from '@/components/screen-title';
import { Text } from '@/components/text';
import { NavBar, RoundButton } from '@/components/top-bar';
import { fonts, layout, spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import type { Contact } from '@/lib/contacts';
import { formatFingerprint } from '@/lib/fingerprint';
import { useAppState } from '@/state/app-state';

const REMOVE_WIDTH = 96;

export default function Contacts() {
  const colors = useColors();
  const { identity, contacts, removeContact } = useAppState();
  if (!identity) return <Redirect href="/" />;

  return (
    <Screen>
      <NavBar kind="back" right={<RoundButton label="Add someone" onPress={() => router.push('/connect/scan')} />} />
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenTitle>Contacts</ScreenTitle>

        <View style={styles.list}>
          {contacts.map((contact) => (
            <ContactRow key={contact.id} contact={contact} onRemove={() => removeContact(contact.id)} />
          ))}
        </View>

        <Text style={[styles.note, { color: colors.muted }]}>
          {contacts.length === 0
            ? 'No contacts yet. Tap + and scan the other person’s code to add them.'
            : 'Swipe left to remove. Removing someone deletes their public key from this phone. You won’t be able to send to them or verify their messages until you scan them again.'}
        </Text>
      </ScrollView>
    </Screen>
  );
}

function ContactRow({ contact, onRemove }: { contact: Contact; onRemove: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.rowBorder, { borderBottomColor: colors.line }]}>
      <ReanimatedSwipeable
        friction={1.5}
        rightThreshold={REMOVE_WIDTH / 2}
        overshootRight={false}
        renderRightActions={() => (
          <Pressable
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${contact.name}`}
            style={[styles.remove, { backgroundColor: colors.alert }]}>
            <Text style={styles.removeLabel}>Remove</Text>
          </Pressable>
        )}>
        <View
          style={[styles.row, { backgroundColor: colors.paper }]}
          accessibilityActions={[{ name: 'remove', label: 'Remove' }]}
          onAccessibilityAction={(event) => event.nativeEvent.actionName === 'remove' && onRemove()}>
          <View style={styles.identity}>
            <Text style={[styles.name, { color: colors.ink }]}>{contact.name}</Text>
            <Text style={[styles.fingerprint, { color: colors.muted }]}>
              {formatFingerprint(contact.fingerprint, 4)}
            </Text>
          </View>
          <Text style={[styles.added, { color: colors.muted }]}>
            Added {contact.addedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </Text>
        </View>
      </ReanimatedSwipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing[8],
  },
  list: {
    marginTop: spacing[2],
  },
  rowBorder: {
    borderBottomWidth: layout.hairline,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: layout.margin,
  },
  identity: {
    flexShrink: 1,
    gap: 3,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.17,
  },
  fingerprint: {
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  added: {
    fontSize: 12,
  },
  remove: {
    width: REMOVE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  note: {
    marginTop: layout.margin,
    marginHorizontal: layout.margin,
    fontSize: 13,
    lineHeight: 19,
  },
});
