'use client';

import { useSyncExternalStore } from 'react';
import { MOBILE_QUERY } from '@/lib/constants';

const subscribeToMobile = (handleChange: () => void): (() => void) => {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener('change', handleChange);
  return () => query.removeEventListener('change', handleChange);
};

const getSnapshot = (): boolean => window.matchMedia(MOBILE_QUERY).matches;

// The server does not know the viewport: callers render every layout and let CSS pick until the client takes over.
const getServerSnapshot = (): null => null;

// `null` before hydration, when the viewport is unknown.
export const useIsMobile = (): boolean | null =>
  useSyncExternalStore(subscribeToMobile, getSnapshot, getServerSnapshot);
