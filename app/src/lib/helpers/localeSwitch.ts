// A locale switch remounts the whole locale layout (the segment key changes) without reloading
// the document, so React state cannot carry anything across it. sessionStorage can.
const STORAGE_KEY = 'localeSwitch';
// A remembered switch older than this was abandoned (new tab, cancelled navigation).
const MAX_AGE_MS = 10_000;

type LocaleSwitch = { hash: string; at: number };

const isLocaleSwitch = (value: unknown): value is LocaleSwitch =>
  typeof value === 'object' &&
  value !== null &&
  'hash' in value &&
  typeof value.hash === 'string' &&
  'at' in value &&
  typeof value.at === 'number';

export const rememberLocaleSwitch = (hash: string): void => {
  try {
    const entry: LocaleSwitch = { hash, at: Date.now() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Storage blocked: the switch still works, only the hash, focus and announcement are skipped.
  }
};

// Reads and clears the remembered switch. Returns null when there is none or it is stale.
export const takeLocaleSwitch = (): LocaleSwitch | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (!raw) return null;

    const entry: unknown = JSON.parse(raw);
    return isLocaleSwitch(entry) && Date.now() - entry.at < MAX_AGE_MS
      ? entry
      : null;
  } catch {
    return null;
  }
};
