import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { randomBytes } from '@noble/hashes/utils.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';

import { bytesToHex, bytesToUtf8, concatBytes, fromBase64, toBase64, utf8ToBytes } from './encoding';

// An encrypted message, as base64 text pasted into any messenger:
//   header ("SVM" | version | suite) | ML-KEM-768 ciphertext | nonce | XChaCha20-Poly1305 ciphertext | ML-DSA-65 signature
// The ML-KEM shared secret goes through HKDF-SHA256 to key XChaCha20-Poly1305. Both fingerprints are
// authenticated as associated data, so a message only opens for the intended recipient AND the
// sender it is checked against; the signature covers everything before it.
const MAGIC = utf8ToBytes('SVM');
const VERSION = 1;
const SUITE_PQ1 = 1;
const HEADER = concatBytes(MAGIC, Uint8Array.of(VERSION, SUITE_PQ1));
/** FIPS 203, ML-KEM-768 ciphertext. */
const KEM_CIPHERTEXT_BYTES = 1088;
/** FIPS 204, ML-DSA-65 signature. */
const SIGNATURE_BYTES = 3309;
const NONCE_BYTES = 24;
const TAG_BYTES = 16;
const SIGNATURE_CONTEXT = utf8ToBytes('svoboda/v1/message');
const KEY_INFO = utf8ToBytes('svoboda/v1/message-key');

export type Sender = { fingerprint: Uint8Array; signingSecretKey: Uint8Array };
export type Recipient = { fingerprint: Uint8Array; encryptionKey: Uint8Array };

export type MessageErrorReason = 'format' | 'signature' | 'decrypt';

export class MessageError extends Error {
  constructor(readonly reason: MessageErrorReason) {
    super(`Message ${reason} check failed`);
    this.name = 'MessageError';
  }
}

export function encryptMessage(text: string, from: Sender, to: Recipient) {
  const { cipherText, sharedSecret } = ml_kem768.encapsulate(to.encryptionKey);
  const nonce = randomBytes(NONCE_BYTES);
  const sealed = xchacha20poly1305(deriveKey(sharedSecret), nonce, associatedData(from.fingerprint, to.fingerprint)).encrypt(
    utf8ToBytes(text),
  );

  const signed = concatBytes(HEADER, cipherText, nonce, sealed);
  const signature = ml_dsa65.sign(signed, from.signingSecretKey, { context: SIGNATURE_CONTEXT });
  return toBase64(concatBytes(signed, signature));
}

/**
 * Verifies `encoded` was signed by `from` and decrypts it for `to`.
 * Throws a MessageError saying which check failed.
 */
export function decryptMessage(
  encoded: string,
  from: { fingerprint: Uint8Array; signingKey: Uint8Array },
  to: { fingerprint: Uint8Array; encryptionSecretKey: Uint8Array },
) {
  let bytes: Uint8Array;
  try {
    bytes = fromBase64(encoded);
  } catch {
    throw new MessageError('format');
  }

  const minLength = HEADER.length + KEM_CIPHERTEXT_BYTES + NONCE_BYTES + TAG_BYTES + SIGNATURE_BYTES;
  if (bytes.length < minLength || bytesToHex(bytes.subarray(0, HEADER.length)) !== bytesToHex(HEADER)) {
    throw new MessageError('format');
  }

  const signed = bytes.subarray(0, bytes.length - SIGNATURE_BYTES);
  const signature = bytes.subarray(bytes.length - SIGNATURE_BYTES);
  if (!ml_dsa65.verify(signature, signed, from.signingKey, { context: SIGNATURE_CONTEXT })) {
    throw new MessageError('signature');
  }

  let offset = HEADER.length;
  const cipherText = signed.subarray(offset, (offset += KEM_CIPHERTEXT_BYTES));
  const nonce = signed.subarray(offset, (offset += NONCE_BYTES));
  const sealed = signed.subarray(offset);

  try {
    // ML-KEM rejects implicitly: a ciphertext for someone else yields an unrelated secret, so the AEAD fails.
    const sharedSecret = ml_kem768.decapsulate(cipherText, to.encryptionSecretKey);
    const plain = xchacha20poly1305(deriveKey(sharedSecret), nonce, associatedData(from.fingerprint, to.fingerprint)).decrypt(
      sealed,
    );
    return bytesToUtf8(plain);
  } catch {
    throw new MessageError('decrypt');
  }
}

function deriveKey(sharedSecret: Uint8Array) {
  return hkdf(sha256, sharedSecret, undefined, KEY_INFO, 32);
}

function associatedData(senderFingerprint: Uint8Array, recipientFingerprint: Uint8Array) {
  return concatBytes(HEADER, senderFingerprint, recipientFingerprint);
}
