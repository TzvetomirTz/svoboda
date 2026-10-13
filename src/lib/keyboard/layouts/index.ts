import { bgBds } from '@/lib/keyboard/layouts/bg-bds';
import { bgPhonetic } from '@/lib/keyboard/layouts/bg-phonetic';
import { bs } from '@/lib/keyboard/layouts/bs';
import { bsCyrl } from '@/lib/keyboard/layouts/bs-cyrl';
import { cnr } from '@/lib/keyboard/layouts/cnr';
import { cnrCyrl } from '@/lib/keyboard/layouts/cnr-cyrl';
import { cs } from '@/lib/keyboard/layouts/cs';
import { de } from '@/lib/keyboard/layouts/de';
import { el } from '@/lib/keyboard/layouts/el';
import { en } from '@/lib/keyboard/layouts/en';
import { es } from '@/lib/keyboard/layouts/es';
import { et } from '@/lib/keyboard/layouts/et';
import { fr } from '@/lib/keyboard/layouts/fr';
import { hr } from '@/lib/keyboard/layouts/hr';
import { lt } from '@/lib/keyboard/layouts/lt';
import { lv } from '@/lib/keyboard/layouts/lv';
import { mk } from '@/lib/keyboard/layouts/mk';
import { pl } from '@/lib/keyboard/layouts/pl';
import { ro } from '@/lib/keyboard/layouts/ro';
import { ru } from '@/lib/keyboard/layouts/ru';
import { sk } from '@/lib/keyboard/layouts/sk';
import { sl } from '@/lib/keyboard/layouts/sl';
import { sq } from '@/lib/keyboard/layouts/sq';
import { srCyrl } from '@/lib/keyboard/layouts/sr-cyrl';
import { srLatn } from '@/lib/keyboard/layouts/sr-latn';
import { tr } from '@/lib/keyboard/layouts/tr';
import type { Layout } from '@/lib/keyboard/layouts/types';
import { uk } from '@/lib/keyboard/layouts/uk';

export type { BottomKey, LetterKey, Layout } from '@/lib/keyboard/layouts/types';

/** Every layout. English first; Settings lists the rest by English name. */
export const layouts: Layout[] = [
  en,
  // Latin
  cs,
  de,
  es,
  et,
  fr,
  hr,
  bs,
  cnr,
  lt,
  lv,
  pl,
  ro,
  sk,
  sl,
  sq,
  srLatn,
  tr,
  // Cyrillic
  bgBds,
  bgPhonetic,
  bsCyrl,
  mk,
  cnrCyrl,
  ru,
  srCyrl,
  uk,
  // Greek
  el,
];

export function layoutById(id: string): Layout | undefined {
  return layouts.find((layout) => layout.id === id);
}
