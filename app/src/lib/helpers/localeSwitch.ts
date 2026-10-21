import {
  LOCALE_SWITCH_MAX_AGE_MS,
  LOCALE_SWITCH_STORAGE_KEY
} from '@/lib/constants';

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
    sessionStorage.setItem(LOCALE_SWITCH_STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Storage blocked: the switch still works, only the hash, focus and announcement are skipped.
  }
};

// Reads and clears the remembered switch. Returns null when there is none or it is stale.
export const takeLocaleSwitch = (): LocaleSwitch | null => {
  try {
    const raw = sessionStorage.getItem(LOCALE_SWITCH_STORAGE_KEY);
    sessionStorage.removeItem(LOCALE_SWITCH_STORAGE_KEY);
    if (!raw) return null;

    const entry: unknown = JSON.parse(raw);
    return isLocaleSwitch(entry) &&
      Date.now() - entry.at < LOCALE_SWITCH_MAX_AGE_MS
      ? entry
      : null;
  } catch {
    return null;
  }
};
