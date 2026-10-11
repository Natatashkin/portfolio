'use client';

import { useSyncExternalStore } from 'react';

const subscribeNoop = (): (() => void) => () => {};

// False during server rendering and hydration, true afterwards, without a hydration mismatch.
export const useIsMounted = (): boolean =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
