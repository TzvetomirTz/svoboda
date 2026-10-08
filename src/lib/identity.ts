import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { getRandomBytes } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { bytesToHex, hexToBytes } from './encoding';
import { fingerprint } from './fingerprint';

// Only the keygen seeds are stored: the full secret keys (2,400 B + 4,032 B) exceed what the
// iOS keychain reliably accepts, and both algorithms derive the same key pair from the same seed.
const STORAGE_KEY = 'svoboda.identity.v1';
const KEM_SEED_BYTES = 64;
const DSA_SEED_BYTES = 32;

const storeOptions: SecureStore.SecureStoreOptions = {
  // Never synced to iCloud or restored onto another device: the private key stays on this phone.
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

type StoredIdentity = {
  v: 1;
  name: string;
  kemSeed: string;
  dsaSeed: string;
};

export type Identity = {
  name: string;
  fingerprint: Uint8Array;
  /** ML-KEM-768: others encrypt to you with `publicKey`. */
  encryption: { publicKey: Uint8Array; secretKey: Uint8Array };
  /** ML-DSA-65: you sign with `secretKey`, others verify with `publicKey`. */
  signing: { publicKey: Uint8Array; secretKey: Uint8Array };
};

/** Thrown where the platform has no secure key storage, such as the web. */
export class IdentityStorageUnavailableError extends Error {
  constructor() {
    super('Secure key storage is not available on this platform.');
    this.name = 'IdentityStorageUnavailableError';
  }
}

/** Returns the identity on this device, or null if none has been created. Throws if storage can't be read. */
export async function loadIdentity(): Promise<Identity | null> {
  if (!(await SecureStore.isAvailableAsync())) throw new IdentityStorageUnavailableError();

  const raw = await SecureStore.getItemAsync(STORAGE_KEY, storeOptions);
  if (raw === null) return null;

  const stored = JSON.parse(raw) as StoredIdentity;
  return deriveIdentity(stored.name, hexToBytes(stored.kemSeed), hexToBytes(stored.dsaSeed));
}

/** Generates a new key pair on this device and stores it. Refuses to replace an existing identity. */
export async function createIdentity(name: string): Promise<Identity> {
  if (await SecureStore.getItemAsync(STORAGE_KEY, storeOptions)) {
    throw new Error('An identity already exists on this device.');
  }

  const kemSeed = getRandomBytes(KEM_SEED_BYTES);
  const dsaSeed = getRandomBytes(DSA_SEED_BYTES);
  const stored: StoredIdentity = { v: 1, name, kemSeed: bytesToHex(kemSeed), dsaSeed: bytesToHex(dsaSeed) };

  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(stored), storeOptions);
  return deriveIdentity(name, kemSeed, dsaSeed);
}

/** Removes the identity from this device for good. Messages encrypted to it can no longer be read. */
export async function deleteIdentity(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEY, storeOptions);
}

function deriveIdentity(name: string, kemSeed: Uint8Array, dsaSeed: Uint8Array): Identity {
  const encryption = ml_kem768.keygen(kemSeed);
  const signing = ml_dsa65.keygen(dsaSeed);
  return { name, fingerprint: fingerprint(encryption.publicKey, signing.publicKey), encryption, signing };
}
