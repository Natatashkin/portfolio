'use client';

import { useSyncExternalStore } from 'react';

function subscribeNoop(): () => void {
  return () => {};
}

// False during server rendering and hydration, true afterwards, without a hydration mismatch.
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}
