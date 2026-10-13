// The ?123 layer of the Svoboda keyboard: two pages of digits and symbols, shared by every
// language. Long-press variants add typographic quotes, dashes and currency signs.

export type SymbolPage = [string[], string[], string[]];

export const symbolPages: [SymbolPage, SymbolPage] = [
  [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '€', '&', '@', '"'],
    ['.', ',', '?', '!', "'"],
  ],
  [
    ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
    ['_', '\\', '|', '~', '<', '>', '«', '»', '$', '£'],
    ['.', ',', '?', '!', "'"],
  ],
];

export const symbolVariants: Record<string, string[]> = {
  '"': ['„', '“', '”', '«', '»'],
  "'": ['’', '‘', '‚', 'ʼ'],
  '-': ['–', '—', '·'],
  '.': ['…'],
  '?': ['¿'],
  '!': ['¡'],
  '€': ['$', '£', '¥', '₴', '₽', 'лв'],
  $: ['€', '£', '¥', '¢'],
  '%': ['‰'],
  '0': ['°'],
  '&': ['§'],
};
