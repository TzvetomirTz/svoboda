import { getRandomValues } from 'expo-crypto';

// The noble libraries draw randomness (ML-KEM encapsulation, hedged ML-DSA signing, nonces) from
// `crypto.getRandomValues`, which Hermes doesn't provide. expo-crypto backs it with the OS CSPRNG.
const globalCrypto = (globalThis.crypto ??= {} as Crypto);
if (typeof globalCrypto.getRandomValues !== 'function') {
  globalCrypto.getRandomValues = getRandomValues as Crypto['getRandomValues'];
}
