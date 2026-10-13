import { graphemes } from '@/lib/keyboard/graphemes';
import { currentLayout, defaultEnabled, moveLanguage, nextLanguage, sanitizeEnabled, toggleLanguage } from '@/lib/keyboard/languages';
import { layoutById, layouts } from '@/lib/keyboard/layouts';
import { latinAccents } from '@/lib/keyboard/layouts/latin-accents';
import { toUpper } from '@/lib/keyboard/shift';
import { symbolPages, symbolVariants } from '@/lib/keyboard/symbols';

describe.each(layouts.map((layout) => [layout.id, layout] as const))('layout %s', (_id, layout) => {
  const letters = layout.rows.flat();

  it('has three letter rows and the fixed bottom row', () => {
    expect(layout.rows).toHaveLength(3);
    layout.rows.forEach((row) => expect(row.length).toBeGreaterThan(0));
    expect(layout.bottom).toEqual(['symbols', 'language', 'space', 'encrypt']);
  });

  it('has no duplicate keys', () => {
    const bases = letters.map((key) => key.base);
    expect(new Set(bases).size).toBe(bases.length);
  });

  it('has one character per key and matching shift variants', () => {
    for (const key of letters) {
      expect(Array.from(key.base)).toHaveLength(1);
      expect(key.shift).toBe(layout.shiftOverrides?.[key.base] ?? toUpper(key.base));
      expect(Array.from(key.shift)).toHaveLength(1);
    }
  });

  it('has long-press variants that never repeat and never duplicate a key', () => {
    const bases = new Set(letters.map((key) => key.base));
    for (const key of letters) {
      expect(new Set(key.variants).size).toBe(key.variants.length);
      for (const variant of key.variants) expect(bases.has(variant)).toBe(false);
    }
  });

  it('has its names and code', () => {
    expect(layout.code).toMatch(/^\S{2}$/u);
    expect(layout.nativeName.length).toBeGreaterThan(0);
    expect(layout.englishName.length).toBeGreaterThan(0);
    expect(layout.layoutName.length).toBeGreaterThan(0);
    expect(layout.language).toMatch(/^[a-z]{2,3}$/);
  });
});

describe('layout contents', () => {
  const letters = (id: string) => layoutById(id)!.rows.map((row) => row.map((key) => key.base).join(''));

  it('covers the whole Bulgarian alphabet in both Bulgarian layouts', () => {
    const alphabet = 'абвгдежзийклмнопрстуфхцчшщъьюя';
    for (const id of ['bg-bds', 'bg-phonetic']) {
      const all = letters(id).join('');
      for (const ch of alphabet) expect(all).toContain(ch);
    }
  });

  it('covers the Russian and Ukrainian alphabets, with ё as a variant', () => {
    const ru = letters('ru').join('');
    for (const ch of 'абвгдежзийклмнопрстуфхцчшщъыьэюя') expect(ru).toContain(ch);
    expect(layoutById('ru')!.rows.flat().find((k) => k.base === 'е')!.variants).toContain('ё');
    const uk = letters('uk').join('');
    for (const ch of "абвгґдеєжзиіїйклмнопрстуфхцчшщьюя'") expect(uk).toContain(ch);
  });

  it('follows the sourced rows exactly', () => {
    expect(letters('bg-bds')).toEqual(['уеишщксдзц', 'ьяаожгтнвмч', 'юйъфхпрлб']);
    expect(layoutById('bg-bds')!.rows[0].find((k) => k.base === 'е')!.variants).toEqual(['э']);
    expect(letters('bg-phonetic')).toEqual(['чшертъуиопящ', 'асдфгхйклюь', 'зжцвбнм']);
    expect(letters('de')).toEqual(['qwertzuiopü', 'asdfghjklöä', 'yxcvbnm']);
    expect(letters('fr')).toEqual(['azertyuiop', 'qsdfghjklm', 'wxcvbn']);
  });

  // Every letter of the language's alphabet can be typed, as a key or a long-press variant.
  it.each([
    ['pl', 'aąbcćdeęfghijklłmnńoóprsśtuwyzźż'],
    ['cs', 'aábcčdďeéěfghiíjklmnňoópqrřsštťuúůvwxyýzž'],
    ['sk', 'aáäbcčdďeéfghiíjklĺľmnňoóôpqrŕsštťuúvwxyýzž'],
    ['hr', 'abcčćdđefghijklmnoprsštuvzž'],
    ['bs', 'abcčćdđefghijklmnoprsštuvzž'],
    ['sr-latn', 'abcčćdđefghijklmnoprsštuvzž'],
    ['cnr', 'abcčćdđefghijklmnoprsśštuvzźž'],
    ['sl', 'abcčdefghijklmnoprsštuvzž'],
    ['sr-cyrl', 'абвгдђежзијклљмнњопрстћуфхцчџш'],
    ['bs-cyrl', 'абвгдђежзијклљмнњопрстћуфхцчџш'],
    ['cnr-cyrl', 'абвгдђежзз́ијклљмнњопрсс́тћуфхцчџш'],
    ['mk', 'абвгдѓежзѕијклљмнњопрстќуфхцчџшѐѝ'],
    ['sq', 'abcçdeëfghijklmnopqrstuvxyz'],
    ['ro', 'aăâbcdefghiîjklmnopqrsștțuvwxyz'],
    ['el', 'αβγδεζηθικλμνξοπρστυφχψωςάέήίόύώϊϋΐΰ'],
    ['tr', 'abcçdefgğhıijklmnoöprsştuüvyz'],
    ['lt', 'aąbcčdeęėfghiįyjklmnoprsštuųūvzž'],
    ['lv', 'aābcčdeēfgģhiījkķlļmnņoprsštuūvzž'],
    ['et', 'abdefghijklmnoprsšzžtuvõäöü'],
    ['de', 'abcdefghijklmnopqrstuvwxyzäöüß'],
    ['fr', 'abcdefghijklmnopqrstuvwxyzàâæçéèêëîïôœùûüÿ'],
    ['es', 'abcdefghijklmnñopqrstuvwxyzáéíóúü'],
  ])('can type every letter of %s', (id, alphabet) => {
    const typeable = new Set(layoutById(id)!.rows.flat().flatMap((key) => [key.base, ...key.variants]));
    expect(graphemes(alphabet).filter((ch) => !typeable.has(ch))).toEqual([]);
  });

  it('follows Turkish casing', () => {
    const keys = layoutById('tr')!.rows.flat();
    expect(keys.find((k) => k.base === 'i')!.shift).toBe('İ');
    expect(keys.find((k) => k.base === 'ı')!.shift).toBe('I');
  });

  it('uppercases i to I everywhere else, whatever the phone language', () => {
    expect(layoutById('en')!.rows[0].find((k) => k.base === 'i')!.shift).toBe('I');
    expect(layoutById('lt')!.rows[0].find((k) => k.base === 'i')!.shift).toBe('I');
  });

  it('puts ж where the sources agree, at the end of the middle row, in Serbian-style Cyrillic', () => {
    for (const id of ['sr-cyrl', 'bs-cyrl', 'cnr-cyrl']) {
      expect(letters(id)).toEqual(['љњертзуиопшђ', 'асдфгхјклчћж', 'џцвбнм']);
    }
  });

  it('types Montenegrin с́ and з́ as one letter, uppercased with shift', () => {
    const с = layoutById('cnr-cyrl')!.rows[1].find((k) => k.base === 'с')!;
    expect(с.variants).toEqual(['с\u0301']);
    expect(graphemes(с.variants[0])).toHaveLength(1);
    expect(toUpper(с.variants[0])).toBe('С\u0301');
  });

  it('puts ß first under s in German', () => {
    expect(layoutById('de')!.rows[1].find((k) => k.base === 's')!.variants[0]).toBe('ß');
  });
});

describe('long-press variants', () => {
  it('offers the specified accents on Latin letters', () => {
    expect(latinAccents.a.slice(0, 8)).toEqual(['á', 'à', 'â', 'ä', 'ã', 'å', 'ą', 'æ']);
    expect(latinAccents.c).toEqual(expect.arrayContaining(['č', 'ć', 'ç']));
    expect(latinAccents.s).toEqual(expect.arrayContaining(['š', 'ś', 'ș', 'ß']));
    expect(latinAccents.z).toEqual(expect.arrayContaining(['ž', 'ź', 'ż']));
    expect(latinAccents.i).toEqual(expect.arrayContaining(['í', 'ì', 'î', 'ï', 'ı']));
  });

  it('looks up variants on the English layout', () => {
    const e = layoutById('en')!.rows[0].find((k) => k.base === 'e')!;
    expect(e.variants).toEqual(latinAccents.e);
    const q = layoutById('en')!.rows[0].find((k) => k.base === 'q')!;
    expect(q.variants).toEqual([]);
  });

  it('never repeats a variant', () => {
    for (const list of [...Object.values(latinAccents), ...Object.values(symbolVariants)]) {
      expect(new Set(list).size).toBe(list.length);
    }
  });

  it('has symbol pages with three rows and no duplicates within a page', () => {
    for (const page of symbolPages) {
      expect(page).toHaveLength(3);
      const keys = page.slice(0, 2).flat();
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});

describe('languages', () => {
  it('defaults to English plus a supported phone language', () => {
    expect(defaultEnabled('en-US')).toEqual(['en']);
    expect(defaultEnabled('bg-BG')).toEqual(['en', 'bg-bds']);
    expect(defaultEnabled('uk_UA')).toEqual(['en', 'uk']);
    expect(defaultEnabled('ja-JP')).toEqual(['en']);
    expect(defaultEnabled('pl-PL')).toEqual(['en', 'pl']);
    expect(defaultEnabled('el-GR')).toEqual(['en', 'el']);
    expect(defaultEnabled('cnr-ME')).toEqual(['en', 'cnr']);
    expect(defaultEnabled(undefined)).toEqual(['en']);
  });

  it('picks the Serbian script from the locale, Cyrillic by default', () => {
    expect(defaultEnabled('sr-RS')).toEqual(['en', 'sr-cyrl']);
    expect(defaultEnabled('sr-Cyrl-RS')).toEqual(['en', 'sr-cyrl']);
    expect(defaultEnabled('sr-Latn-RS')).toEqual(['en', 'sr-latn']);
    expect(defaultEnabled('bs-BA')).toEqual(['en', 'bs']);
    expect(defaultEnabled('bs-Cyrl-BA')).toEqual(['en', 'bs-cyrl']);
    expect(defaultEnabled('cnr-Cyrl-ME')).toEqual(['en', 'cnr-cyrl']);
  });

  it('cycles in the user’s order and wraps', () => {
    const enabled = ['de', 'en', 'bg-bds'];
    expect(nextLanguage(enabled, 'de')).toBe('en');
    expect(nextLanguage(enabled, 'en')).toBe('bg-bds');
    expect(nextLanguage(enabled, 'bg-bds')).toBe('de');
    expect(nextLanguage(['en'], 'en')).toBe('en');
    expect(nextLanguage(enabled, 'fr')).toBe('de');
  });

  it('keeps at least one language enabled', () => {
    expect(toggleLanguage(['en'], 'en')).toEqual(['en']);
    expect(toggleLanguage(['en', 'de'], 'en')).toEqual(['de']);
    expect(toggleLanguage(['en'], 'fr')).toEqual(['en', 'fr']);
  });

  it('reorders', () => {
    expect(moveLanguage(['en', 'de', 'fr'], 'fr', -1)).toEqual(['en', 'fr', 'de']);
    expect(moveLanguage(['en', 'de', 'fr'], 'en', -1)).toEqual(['en', 'de', 'fr']);
    expect(moveLanguage(['en', 'de', 'fr'], 'en', 1)).toEqual(['de', 'en', 'fr']);
  });

  it('cleans stored preferences', () => {
    expect(sanitizeEnabled(['xx', 'de', 'de', 3])).toEqual(['de']);
    expect(sanitizeEnabled('en')).toEqual(['en']);
    expect(sanitizeEnabled([])).toEqual(['en']);
  });

  it('falls back to the first enabled language', () => {
    expect(currentLayout(['de', 'en'], 'fr').id).toBe('de');
    expect(currentLayout(['de', 'en'], 'en').id).toBe('en');
  });
});
