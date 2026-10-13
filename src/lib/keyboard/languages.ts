import { layoutById, layouts, type Layout } from '@/lib/keyboard/layouts';

// Which layouts the Svoboda keyboard cycles through, in which order. Not sensitive.

/**
 * English, plus the phone's language if there is a layout for it. A script in the locale picks
 * between layouts of the same language (sr-Latn → Serbian Latin).
 */
export function defaultEnabled(deviceLocale: string | undefined): string[] {
  const parts = deviceLocale?.toLowerCase().split(/[-_]/) ?? [];
  const [language] = parts;
  const script = parts.find((part) => part === 'latn' || part === 'cyrl');
  const candidates = layouts.filter((layout) => layout.language === language);
  // A bare "sr" means Cyrillic; the Latin layout only when the locale says Latn.
  const device =
    candidates.find((layout) => script && layout.id.endsWith(`-${script}`)) ??
    candidates.find((layout) => !layout.id.endsWith('-latn'));
  return device && device.id !== 'en' ? ['en', device.id] : ['en'];
}

/** Known ids only, without repeats, never empty. */
export function sanitizeEnabled(ids: unknown): string[] {
  if (!Array.isArray(ids)) return ['en'];
  const known = ids.filter((id): id is string => typeof id === 'string' && layoutById(id) !== undefined);
  const unique = [...new Set(known)];
  return unique.length > 0 ? unique : ['en'];
}

/** The language after `current` in the user's order, wrapping around. */
export function nextLanguage(enabled: string[], current: string): string {
  const index = enabled.indexOf(current);
  return enabled[(index + 1) % enabled.length] ?? enabled[0];
}

export function toggleLanguage(enabled: string[], id: string): string[] {
  if (enabled.includes(id)) return enabled.length > 1 ? enabled.filter((e) => e !== id) : enabled;
  return [...enabled, id];
}

export function moveLanguage(enabled: string[], id: string, direction: -1 | 1): string[] {
  const from = enabled.indexOf(id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= enabled.length) return enabled;
  const next = [...enabled];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/** The current layout if it is still enabled, otherwise the first enabled one. */
export function currentLayout(enabled: string[], current: string | undefined): Layout {
  const id = current && enabled.includes(current) ? current : enabled[0];
  return layoutById(id) ?? layouts[0];
}
