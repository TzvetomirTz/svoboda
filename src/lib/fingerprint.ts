import { sha256 } from '@noble/hashes/sha2.js';

import { bytesToHex, concatBytes, utf8ToBytes } from './encoding';

const FINGERPRINT_BYTES = 16;
const DOMAIN = utf8ToBytes('svoboda/v1/fingerprint');

/** 16 bytes identifying a person's pair of public keys. */
export function fingerprint(encryptionKey: Uint8Array, signingKey: Uint8Array) {
  return sha256(concatBytes(DOMAIN, encryptionKey, signingKey)).slice(0, FINGERPRINT_BYTES);
}

/** Uppercase hex in groups of four, as the brand book asks: `7F3A 91C2 0B44 E1D9`. */
export function formatFingerprint(fp: Uint8Array, groups = 8) {
  const hex = bytesToHex(fp).toUpperCase();
  return Array.from({ length: groups }, (_, i) => hex.slice(i * 4, i * 4 + 4)).join(' ');
}
