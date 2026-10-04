"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  THEME_STORAGE_KEY,
  applyTheme,
  readStoredTheme,
  storeTheme,
  type Theme,
} from "@/lib/theme/theme";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);

  // Keeps other tabs in sync; `key === null` means the whole storage was cleared.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    applyTheme(readStoredTheme());
    onChange();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

// The server never knows the stored theme, so it always renders as "system".
function getServerSnapshot(): Theme {
  return "system";
}

export function useTheme(): { theme: Theme; setTheme: (theme: Theme) => void } {
  // Reading localStorage on every snapshot is safe: it returns a primitive string, so equal values never re-render.
  const theme = useSyncExternalStore(subscribe, readStoredTheme, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    storeTheme(next);
    applyTheme(next);
    listeners.forEach((listener) => listener());
  }, []);

  return { theme, setTheme };
}
