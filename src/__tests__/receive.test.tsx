// jest.mock factories can't use imports.
/* eslint-disable @typescript-eslint/no-require-imports */
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';

import Receive from '@/app/(main)/receive';
import { decryptMessage, MessageError } from '@/lib/message';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
jest.mock('expo-clipboard', () => ({ getStringAsync: jest.fn(), setStringAsync: jest.fn() }));
jest.mock('@/lib/message', () => ({ ...jest.requireActual('@/lib/message'), decryptMessage: jest.fn() }));
jest.mock('../../modules/svoboda-secure', () => ({ setSensitiveClipboardString: jest.fn(() => Promise.resolve()) }));

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
  useAppState: () => ({
    identity: mockIdentity,
    selectedContact: mockContact,
    contacts: [mockContact],
    selectContact: jest.fn(),
  }),
}));

const getString = Clipboard.getStringAsync as jest.Mock;
const decrypt = decryptMessage as jest.Mock;

async function pasteAndDecrypt() {
  await render(<Receive />);
  await fireEvent.press(screen.getByRole('button', { name: 'Paste and decrypt' }));
}

beforeEach(() => jest.clearAllMocks());

describe('Receive: errors', () => {
  it('tells the user when the clipboard can’t be read, and the button recovers', async () => {
    getString.mockRejectedValue(new Error('denied'));
    await pasteAndDecrypt();
    expect(await screen.findByText('Could not read the clipboard. Try again.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Paste and decrypt' })).toBeEnabled();
    expect(decrypt).not.toHaveBeenCalled();
  });

  it('shows a neutral message for an unexpected error instead of blaming the sender', async () => {
    getString.mockResolvedValue('SVOBODA-CIPHERTEXT');
    decrypt.mockImplementation(() => {
      throw new TypeError('something broke');
    });
    await pasteAndDecrypt();
    expect(await screen.findByText('Could not open this message. Try again.')).toBeTruthy();
    expect(screen.queryByText(/not encrypted for you/)).toBeNull();
  });

  it('still explains a failed check', async () => {
    getString.mockResolvedValue('SVOBODA-CIPHERTEXT');
    decrypt.mockImplementation(() => {
      throw new MessageError('decrypt');
    });
    await pasteAndDecrypt();
    expect(await screen.findByText('Could not decrypt. This message was not encrypted for you.')).toBeTruthy();
  });

  it('asks for a message when the clipboard is empty', async () => {
    getString.mockResolvedValue('  ');
    await pasteAndDecrypt();
    expect(await screen.findByText('Nothing to paste. Copy the encrypted message first.')).toBeTruthy();
  });
});
