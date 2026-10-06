'use client';

import { useSyncExternalStore } from 'react';

function subscribe(): () => void {
  return () => {};
}

// False during server rendering and hydration, true afterwards, without a hydration mismatch.
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
