export { bytesToHex, concatBytes, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';

export function toBase64(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** Throws if `text` isn't valid base64. Whitespace, which messengers sometimes insert, is ignored. */
export function fromBase64(text: string) {
  const binary = atob(text.replace(/\s+/g, ''));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/** Strict UTF-8 decoding: throws on malformed input. */
export function bytesToUtf8(bytes: Uint8Array) {
  if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8', { fatal: true }).decode(bytes);

  // Hermes ships TextEncoder but not always TextDecoder.
  let out = '';
  for (let i = 0; i < bytes.length; ) {
    const lead = bytes[i++];
    const [extra, min] = lead < 0x80 ? [0, 0] : lead >= 0xf0 && lead < 0xf5 ? [3, 0x10000] : lead >= 0xe0 ? [2, 0x800] : lead >= 0xc2 ? [1, 0x80] : [-1, 0];
    if (extra < 0 || lead >= 0xf5 || i + extra > bytes.length) throw new TypeError('Invalid UTF-8');

    let code = extra === 0 ? lead : lead & (0x3f >> extra);
    for (let k = 0; k < extra; k++) {
      const next = bytes[i++];
      if ((next & 0xc0) !== 0x80) throw new TypeError('Invalid UTF-8');
      code = (code << 6) | (next & 0x3f);
    }
    if (code < min || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) throw new TypeError('Invalid UTF-8');
    out += String.fromCodePoint(code);
  }
  return out;
}
