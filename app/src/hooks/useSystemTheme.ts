'use client';

import { useSyncExternalStore } from 'react';
import { DARK_QUERY } from '@/lib/constants';
import type { StoredTheme } from '@/lib/theme/theme';

// Light matches the default styles, so it is also the answer when the preference cannot be read.
const canMatchMedia = (): boolean => typeof window.matchMedia === 'function';

const subscribeToSystemTheme = (handleChange: () => void): (() => void) => {
  if (!canMatchMedia()) return () => {};

  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', handleChange);
  return () => query.removeEventListener('change', handleChange);
};

const getSnapshot = (): StoredTheme =>
  canMatchMedia() && window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';

// Without a browser there is no preference.
const getServerSnapshot = (): StoredTheme => 'light';

// The theme the system asks for, kept current while the OS setting changes.
export const useSystemTheme = (): StoredTheme =>
  useSyncExternalStore(subscribeToSystemTheme, getSnapshot, getServerSnapshot);
