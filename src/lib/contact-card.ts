import { sha256 } from '@noble/hashes/sha2.js';

import { bytesToHex, bytesToUtf8, concatBytes, fromBase64, toBase64, utf8ToBytes } from './encoding';

// What "Be added" shows and "Add someone" scans: a name and both public keys.
// Layout: "SVC" | version | suite | name length | name (UTF-8) | ML-KEM-768 key | ML-DSA-65 key
const MAGIC = utf8ToBytes('SVC');
const VERSION = 1;
/** ML-KEM-768 + ML-DSA-65. A new suite (FN-DSA, a hybrid) gets a new id. */
const SUITE_PQ1 = 1;
/** FIPS 203, ML-KEM-768 encapsulation key. */
const KEM_KEY_BYTES = 1184;
/** FIPS 204, ML-DSA-65 public key. */
const DSA_KEY_BYTES = 1952;
const MAX_NAME_BYTES = 255;

export type ContactCard = {
  name: string;
  encryptionKey: Uint8Array;
  signingKey: Uint8Array;
};

export class InvalidContactCardError extends Error {
  constructor() {
    super('This is not a Svoboda contact code.');
    this.name = 'InvalidContactCardError';
  }
}

export function encodeContactCard({ name, encryptionKey, signingKey }: ContactCard) {
  const nameBytes = utf8ToBytes(name).slice(0, MAX_NAME_BYTES);
  return toBase64(
    concatBytes(MAGIC, Uint8Array.of(VERSION, SUITE_PQ1, nameBytes.length), nameBytes, encryptionKey, signingKey),
  );
}

export function decodeContactCard(text: string): ContactCard {
  try {
    const bytes = fromBase64(text);
    const header = MAGIC.length + 3;
    if (bytesToHex(bytes.subarray(0, MAGIC.length)) !== bytesToHex(MAGIC)) throw new Error();
    if (bytes[MAGIC.length] !== VERSION || bytes[MAGIC.length + 1] !== SUITE_PQ1) throw new Error();

    const nameLength = bytes[MAGIC.length + 2];
    if (bytes.length !== header + nameLength + KEM_KEY_BYTES + DSA_KEY_BYTES) throw new Error();

    const keysStart = header + nameLength;
    return {
      name: bytesToUtf8(bytes.subarray(header, keysStart)),
      encryptionKey: bytes.slice(keysStart, keysStart + KEM_KEY_BYTES),
      signingKey: bytes.slice(keysStart + KEM_KEY_BYTES),
    };
  } catch {
    throw new InvalidContactCardError();
  }
}

// A card is ~4.2 KB of text, more than one comfortably scannable QR code, so it is shown as a
// loop of smaller codes. Each frame: "SVOBODA:<card id>:<n>/<total>:<chunk>".
const FRAME_PREFIX = 'SVOBODA';
const FRAME_CHUNK_CHARS = 360;
const FRAME_PATTERN = /^SVOBODA:([0-9a-f]{8}):(\d+)\/(\d+):([A-Za-z0-9+/=]+)$/;

export function splitIntoFrames(card: string) {
  const id = bytesToHex(sha256(utf8ToBytes(card)).subarray(0, 4));
  const total = Math.ceil(card.length / FRAME_CHUNK_CHARS);
  return Array.from(
    { length: total },
    (_, i) => `${FRAME_PREFIX}:${id}:${i + 1}/${total}:${card.slice(i * FRAME_CHUNK_CHARS, (i + 1) * FRAME_CHUNK_CHARS)}`,
  );
}

export type FrameProgress = { received: number; total: number; card: string | null };

/** Collects scanned frames until a whole card has been read. */
export class FrameAssembler {
  private id: string | null = null;
  private chunks: string[] = [];

  /** Returns null for codes that aren't Svoboda frames. */
  add(data: string): FrameProgress | null {
    const match = FRAME_PATTERN.exec(data);
    if (!match) return null;

    const [, id, indexText, totalText, chunk] = match;
    const index = Number(indexText) - 1;
    const total = Number(totalText);
    if (total < 1 || index < 0 || index >= total) return null;

    if (id !== this.id || this.chunks.length !== total) {
      this.id = id;
      this.chunks = new Array(total);
    }
    this.chunks[index] = chunk;

    const received = this.chunks.filter(Boolean).length;
    const card = received === total ? this.chunks.join('') : null;
    if (card !== null && bytesToHex(sha256(utf8ToBytes(card)).subarray(0, 4)) !== id) {
      this.reset();
      return { received: 0, total, card: null };
    }
    return { received, total, card };
  }

  reset() {
    this.id = null;
    this.chunks = [];
  }
}
