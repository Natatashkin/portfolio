'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  applyTheme,
  readStoredTheme,
  storeTheme,
  type Theme,
  THEME_STORAGE_KEY
} from '@/lib/theme/theme';

const listeners = new Set<() => void>();

const subscribeToTheme = (handleChange: () => void): (() => void) => {
  listeners.add(handleChange);

  // Keeps other tabs in sync; `key === null` means the whole storage was cleared.
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    applyTheme(readStoredTheme());
    handleChange();
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    listeners.delete(handleChange);
    window.removeEventListener('storage', handleStorage);
  };
};

// The server never knows the stored theme, so it always renders as "system".
const getServerSnapshot = (): Theme => 'system';

export const useTheme = (): {
  theme: Theme;
  setTheme: (theme: Theme) => void;
} => {
  // Reading localStorage on every snapshot is safe: it returns a primitive string, so equal values never re-render.
  const theme = useSyncExternalStore(
    subscribeToTheme,
    readStoredTheme,
    getServerSnapshot
  );

  const setTheme = useCallback((next: Theme) => {
    storeTheme(next);
    applyTheme(next);
    listeners.forEach((listener) => listener());
  }, []);

  return { theme, setTheme };
};
