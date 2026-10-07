import { File, Paths } from 'expo-file-system';

import { bytesToHex, fromBase64, hexToBytes, toBase64 } from './encoding';
import { fingerprint } from './fingerprint';

// Public keys aren't secret, so contacts live in the app's sandboxed documents folder
// (encrypted by the OS while the phone is locked) rather than the size-limited keychain.
const file = new File(Paths.document, 'contacts.json');

export type Contact = {
  /** Hex fingerprint; unique per pair of public keys. */
  id: string;
  name: string;
  fingerprint: Uint8Array;
  encryptionKey: Uint8Array;
  signingKey: Uint8Array;
  addedAt: Date;
};

type StoredContact = {
  name: string;
  encryptionKey: string;
  signingKey: string;
  addedAt: string;
};

export function makeContact(name: string, encryptionKey: Uint8Array, signingKey: Uint8Array): Contact {
  const fp = fingerprint(encryptionKey, signingKey);
  return { id: bytesToHex(fp), name, fingerprint: fp, encryptionKey, signingKey, addedAt: new Date() };
}

/** Newest first. */
export async function loadContacts(): Promise<Contact[]> {
  if (!file.exists) return [];

  const stored = JSON.parse(await file.text()) as StoredContact[];
  return stored
    .map((c) => {
      const contact = makeContact(c.name, fromBase64(c.encryptionKey), fromBase64(c.signingKey));
      return { ...contact, addedAt: new Date(c.addedAt) };
    })
    .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
}

export function saveContacts(contacts: Contact[]) {
  const stored: StoredContact[] = contacts.map((c) => ({
    name: c.name,
    encryptionKey: toBase64(c.encryptionKey),
    signingKey: toBase64(c.signingKey),
    addedAt: c.addedAt.toISOString(),
  }));
  if (!file.exists) file.create();
  file.write(JSON.stringify(stored));
}

export function fingerprintOf(contact: Pick<Contact, 'id'>) {
  return hexToBytes(contact.id);
}
