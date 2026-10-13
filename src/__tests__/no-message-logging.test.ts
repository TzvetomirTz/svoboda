import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

// The message must never be logged, sent to analytics or crash reports, or put in an error. This
// fails if any file on the message's path contains a logging, analytics or crash-reporting call,
// so a log line can't be added there by accident. Tests and comments don't count.

const ROOT = join(__dirname, '..', '..');

/** Everything message text passes through: typed and encrypted on Send, decrypted on Receive. */
const MESSAGE_PATH = [
  'src/app/(main)/send.tsx',
  'src/app/(main)/receive.tsx',
  'src/components/keyboard',
  'src/lib/keyboard',
  'src/lib/message.ts',
  'src/lib/encoding.ts',
  'modules/svoboda-secure/index.ts',
  'modules/svoboda-secure/ios',
  'modules/svoboda-secure/android/src',
];

/**
 * Off the message path: preferences.ts only reads and writes the language list and logs file
 * errors, which can't contain the message.
 */
const EXCEPTIONS = ['src/lib/keyboard/preferences.ts'];

const FORBIDDEN: [string, RegExp][] = [
  ['console', /\bconsole\s*\./],
  ['logger', /\blog(ger)?\s*\.\s*(debug|info|warn|error|log|trace)\s*\(/i],
  ['Android Log', /\bLog\s*\.\s*[vdiwe]\s*\(/],
  ['Swift print', /(^|[^.\w])(print|debugPrint|NSLog|os_log)\s*\(/],
  ['Logger', /\bLogger\s*\(/],
  ['analytics or crash reporting', /\b(analytics|crashlytics|sentry|bugsnag|datadog)\b/i],
];

function files(path: string): string[] {
  const full = join(ROOT, path);
  if (statSync(full).isFile()) return [full];
  return readdirSync(full).flatMap((name) => (name === '__tests__' ? [] : files(join(path, name))));
}

/** Source without comments, keeping line breaks so line numbers still match. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

export function findLogging(source: string): string[] {
  const found: string[] = [];
  stripComments(source)
    .split('\n')
    .forEach((line, index) => {
      for (const [name, pattern] of FORBIDDEN) if (pattern.test(line)) found.push(`${index + 1}: ${name}: ${line.trim()}`);
    });
  return found;
}

describe('message path logging check', () => {
  const sources = MESSAGE_PATH.flatMap(files)
    .filter((file) => /\.(tsx?|kt|swift)$/.test(file))
    .filter((file) => !EXCEPTIONS.includes(relative(ROOT, file)));

  it('covers the files the message passes through', () => {
    expect(sources.length).toBeGreaterThan(15);
    expect(sources.some((f) => f.endsWith('send.tsx'))).toBe(true);
    expect(sources.some((f) => f.endsWith('SvobodaSecureModule.kt'))).toBe(true);
    expect(sources.some((f) => f.endsWith('SvobodaSecureModule.swift'))).toBe(true);
  });

  it.each(MESSAGE_PATH)('%s has no logging, analytics or crash reporting', (path) => {
    const problems = files(path)
      .filter((file) => sources.includes(file))
      .flatMap((file) => findLogging(readFileSync(file, 'utf8')).map((p) => `${relative(ROOT, file)}:${p}`));
    expect(problems).toEqual([]);
  });

  it('catches the calls it looks for', () => {
    expect(findLogging('console.log(buffer.text)')).toHaveLength(1);
    expect(findLogging('  console.error("x", e)')).toHaveLength(1);
    expect(findLogging('Log.d(TAG, text)')).toHaveLength(1);
    expect(findLogging('print(text)')).toHaveLength(1);
    expect(findLogging('NSLog(@"%@", text)')).toHaveLength(1);
    expect(findLogging('Sentry.captureException(e)')).toHaveLength(1);
    expect(findLogging('logger.info(message)')).toHaveLength(1);
    expect(findLogging('// console.log(text) in a comment')).toHaveLength(0);
    expect(findLogging('const blueprint = fingerprint(x)')).toHaveLength(0);
  });
});
