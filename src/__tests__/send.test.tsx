// jest.mock factories can't use imports.
/* eslint-disable @typescript-eslint/no-require-imports */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Keyboard } from 'react-native';

import Send from '@/app/(main)/send';
import { encryptMessage } from '@/lib/message';
import { resetKeyboardPreferencesForTests } from '@/lib/keyboard/preferences';
import { setSensitiveClipboardString } from '../../modules/svoboda-secure';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
jest.mock('expo-file-system', () => ({
  Paths: { document: '/doc' },
  File: class {
    exists = false;
    create() {}
    write() {}
    textSync() {
      return '';
    }
  },
}));
jest.mock('@/lib/message', () => ({ encryptMessage: jest.fn(() => 'SVOBODA-CIPHERTEXT') }));
jest.mock('../../modules/svoboda-secure', () => {
  const { View } = require('react-native');
  return { SecureInputView: View, setSensitiveClipboardString: jest.fn(() => Promise.resolve()) };
});

const mockContact = {
  id: 'c1',
  name: 'Ana Petrova',
  fingerprint: new Uint8Array(32).fill(0xa1),
  encryptionKey: new Uint8Array([1]),
  signingKey: new Uint8Array([2]),
};
const mockIdentity = {
  name: 'Me',
  fingerprint: new Uint8Array(32).fill(0xff),
  signing: { secretKey: new Uint8Array([3]) },
  encryption: { secretKey: new Uint8Array([4]) },
};
jest.mock('@/state/app-state', () => ({
  useAppState: () => ({ identity: mockIdentity, selectedContact: mockContact, contacts: [mockContact], selectContact: jest.fn() }),
}));

function key(name: string) {
  return screen.getByRole('keyboardkey', { name });
}

async function openSvobodaKeyboard() {
  await fireEvent.press(screen.getByRole('button', { name: 'Svoboda keyboard' }));
}

async function type(...names: string[]) {
  for (const name of names) await fireEvent.press(key(name));
}

beforeEach(() => {
  resetKeyboardPreferencesForTests({ enabled: ['en', 'bg-bds'], current: 'en', tipSeen: true });
  jest.clearAllMocks();
});

describe('Send: two entry points', () => {
  it('tapping the message box opens the system keyboard, not the Svoboda keyboard', async () => {
    await render(<Send />);
    const input = screen.getByTestId('message-input');
    await fireEvent(input, 'focus');
    expect(screen.queryByRole('keyboardkey', { name: 'Space' })).toBeNull();
    expect(screen.getByTestId('message-input')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Svoboda keyboard' })).not.toBeSelected();
  });

  it('the Svoboda keyboard button opens the Svoboda keyboard and closes the system keyboard', async () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss');
    await render(<Send />);
    await fireEvent(screen.getByTestId('message-input'), 'focus');
    await openSvobodaKeyboard();

    expect(dismiss).toHaveBeenCalled();
    expect(key('Space')).toBeTruthy();
    // No TextInput is mounted, so no OS input session can be open.
    expect(screen.queryByTestId('message-input')).toBeNull();
    expect(screen.getByRole('button', { name: 'Svoboda keyboard' })).toBeSelected();
    // The big title and the Copy encrypted button make room for the keyboard.
    expect(screen.queryByText('Send')).toBeNull();
    expect(screen.queryByText('Copy encrypted')).toBeNull();
  });

  it('pressing the button again keeps the Svoboda keyboard open (never a toggle)', async () => {
    await render(<Send />);
    await openSvobodaKeyboard();
    await openSvobodaKeyboard();
    expect(key('Space')).toBeTruthy();
  });

  it('the chevron hides the Svoboda keyboard and brings the TextInput back with the text', async () => {
    await render(<Send />);
    await openSvobodaKeyboard();
    await type('H', 'i');
    await fireEvent.press(screen.getByRole('button', { name: 'Hide Svoboda keyboard' }));
    expect(screen.queryByRole('keyboardkey', { name: 'Space' })).toBeNull();
    expect(screen.getByTestId('message-input')).toHaveDisplayValue('Hi');
  });

  it('a tap in the text while the Svoboda keyboard is open moves the cursor and keeps the system keyboard closed', async () => {
    await render(<Send />);
    await openSvobodaKeyboard();
    await type('A', 'b');
    const view = screen.getByRole('adjustable', { name: 'Message' });
    // Move the cursor between "A" and "b", then tap in the text: with no layout in tests a tap
    // puts the cursor at the end.
    await fireEvent(view, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    await type('x');
    expect(screen.getByText('Axb')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('message-view-text'), { nativeEvent: { locationX: 500, locationY: 500 } });
    await type('y');
    expect(screen.getByText('Axby')).toBeTruthy();
    expect(screen.queryByTestId('message-input')).toBeNull();
    expect(key('Space')).toBeTruthy();
  });

  it('keeps text and cursor when switching from the system keyboard', async () => {
    await render(<Send />);
    const input = screen.getByTestId('message-input');
    await fireEvent(input, 'focus');
    await fireEvent.changeText(input, 'Hello world');
    await fireEvent(input, 'selectionChange', { nativeEvent: { selection: { start: 5, end: 5 } } });
    await openSvobodaKeyboard();
    await fireEvent.press(key('Numbers and symbols'));
    await type(',');
    expect(screen.getByText('Hello, world')).toBeTruthy();
  });
});

describe('Send: typing on the Svoboda keyboard', () => {
  it('capitalises the first letter, then types lowercase', async () => {
    await render(<Send />);
    await openSvobodaKeyboard();
    expect(key('Shift on')).toBeTruthy();
    await type('H', 'e', 'y');
    expect(screen.getByText('Hey')).toBeTruthy();
  });

  it('deletes and types space and return', async () => {
    await render(<Send />);
    await openSvobodaKeyboard();
    await type('A', 'b', 'Delete', 'Space');
    await fireEvent.press(key('Numbers and symbols'));
    await type('Return', '1');
    expect(screen.getByText('A \n1')).toBeTruthy();
  });

  it('types an accent through the screen reader action', async () => {
    await render(<Send />);
    await openSvobodaKeyboard();
    await fireEvent(key('E'), 'accessibilityAction', { nativeEvent: { actionName: 'variant-0' } });
    expect(screen.getByText('É')).toBeTruthy();
  });

  it('cycles languages with a tap on the language key', async () => {
    await render(<Send />);
    await openSvobodaKeyboard();
    await fireEvent.press(screen.getByRole('keyboardkey', { name: /^Language: English/ }));
    expect(screen.getByText('Svoboda keyboard · Bulgarian')).toBeTruthy();
    expect(screen.getByRole('keyboardkey', { name: 'Ж' })).toBeTruthy();
  });
});

describe('Send: Encrypt', () => {
  it('the Encrypt key does what Copy encrypted does, closes the keyboard and clears the message', async () => {
    await render(<Send />);
    await openSvobodaKeyboard();
    await type('H', 'i');
    await fireEvent.press(key('Encrypt'));

    await waitFor(() => expect(setSensitiveClipboardString).toHaveBeenCalledWith('SVOBODA-CIPHERTEXT'));
    expect(encryptMessage).toHaveBeenCalledWith(
      'Hi',
      { fingerprint: mockIdentity.fingerprint, signingSecretKey: mockIdentity.signing.secretKey },
      { fingerprint: mockContact.fingerprint, encryptionKey: mockContact.encryptionKey },
    );
    expect(screen.queryByRole('keyboardkey', { name: 'Space' })).toBeNull();
    expect(await screen.findByText('Copied')).toBeTruthy();
    expect(screen.getByText('Paste it into any messenger. Only Ana can read it.')).toBeTruthy();
    expect(screen.getByTestId('message-input')).toHaveDisplayValue('');
    expect(screen.getByText('0 chars')).toBeTruthy();
  });

  it('Copy encrypted calls the same action and clears the message', async () => {
    await render(<Send />);
    const input = screen.getByTestId('message-input');
    await fireEvent.changeText(input, 'Hi');
    await fireEvent.press(screen.getByRole('button', { name: 'Copy encrypted' }));

    await waitFor(() => expect(setSensitiveClipboardString).toHaveBeenCalledWith('SVOBODA-CIPHERTEXT'));
    expect(encryptMessage).toHaveBeenCalledWith('Hi', expect.anything(), expect.anything());
    expect(await screen.findByText('Copied')).toBeTruthy();
    expect(screen.getByTestId('message-input')).toHaveDisplayValue('');
  });

  it('the Encrypt key is disabled with an empty message', async () => {
    await render(<Send />);
    await openSvobodaKeyboard();
    expect(key('Encrypt')).toBeDisabled();
  });
});

describe('Send: first-use tip', () => {
  it('shows once and is remembered after dismissing', async () => {
    resetKeyboardPreferencesForTests({ enabled: ['en'], current: 'en', tipSeen: false });
    const { unmount } = await render(<Send />);
    expect(screen.getByText(/use the Svoboda keyboard/)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Dismiss tip' }));
    expect(screen.queryByText(/use the Svoboda keyboard/)).toBeNull();
    await unmount();
    await render(<Send />);
    expect(screen.queryByText(/use the Svoboda keyboard/)).toBeNull();
  });
});
