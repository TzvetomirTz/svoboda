// Long-press variants for every Latin layout. The aim is that any Latin-script European language
// can be typed, not only the ones with a full layout: the first variants of each letter follow the
// keyboard spec, the rest add Romanian (ă), Baltic (ā ē ī ū ķ ļ ņ ģ ė į ų), Maltese (ċ ġ ħ),
// Welsh (ŵ ŷ), Turkish (ş), Icelandic and Faroese (ð þ) and French (œ).

export const latinAccents: Record<string, string[]> = {
  a: ['á', 'à', 'â', 'ä', 'ã', 'å', 'ą', 'æ', 'ă', 'ā'],
  c: ['č', 'ć', 'ç', 'ċ'],
  d: ['ď', 'đ', 'ð'],
  e: ['é', 'è', 'ê', 'ë', 'ę', 'ě', 'ė', 'ē'],
  g: ['ğ', 'ģ', 'ġ'],
  h: ['ħ'],
  i: ['í', 'ì', 'î', 'ï', 'ı', 'į', 'ī'],
  k: ['ķ'],
  l: ['ł', 'ľ', 'ļ', 'ĺ'],
  n: ['ñ', 'ń', 'ň', 'ņ'],
  o: ['ó', 'ò', 'ô', 'ö', 'õ', 'ø', 'ő', 'œ'],
  r: ['ř', 'ŕ'],
  s: ['š', 'ś', 'ș', 'ß', 'ş'],
  t: ['ť', 'ț', 'þ'],
  u: ['ú', 'ù', 'û', 'ü', 'ů', 'ű', 'ų', 'ū'],
  w: ['ŵ'],
  y: ['ý', 'ÿ', 'ŷ'],
  z: ['ž', 'ź', 'ż'],
};

/** `latinAccents` with some letters' variants moved to the front, for a language's own letters. */
export function accentsFirst(first: Record<string, string[]>): Record<string, string[]> {
  const result = { ...latinAccents };
  for (const [letter, own] of Object.entries(first)) {
    result[letter] = [...own, ...(latinAccents[letter] ?? []).filter((v) => !own.includes(v))];
  }
  return result;
}
