export const THEME_STORAGE_KEY = 'theme';

export type StoredTheme = 'light' | 'dark';
export type Theme = StoredTheme | 'system';

const isStoredTheme = (value: unknown): value is StoredTheme =>
  value === 'light' || value === 'dark';

// Storage access can throw (private mode, blocked site data); every failure falls back to "system".
export const readStoredTheme = (): Theme => {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return isStoredTheme(value) ? value : 'system';
  } catch {
    return 'system';
  }
};

export const storeTheme = (theme: Theme): void => {
  try {
    if (theme === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Not persisted; the choice still applies to the current page.
  }
};

// `themeScript` below repeats this logic as a string (it cannot import modules): change both together.
export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
    root.style.removeProperty('color-scheme');
  } else {
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
  }
};

// Theme transitions stay off until after the first frame, so the initial paint does not animate.
export const enableThemeTransitions = (): void => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add('theme-ready');
    });
  });
};

// Puts the stored theme back on <html>. React clears attributes it does not own (data-theme, style,
// the theme-ready class) when it remounts <html> on a locale switch, and the inline script only
// runs on a document load.
export const restoreTheme = (): void => {
  applyTheme(readStoredTheme());
  enableThemeTransitions();
};

// Runs synchronously in <head> before the first paint. It mirrors readStoredTheme + applyTheme because
// it cannot import modules, then enables theme transitions only after the first frame.
export const themeScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});if(t==="light"||t==="dark"){d.setAttribute("data-theme",t);d.style.colorScheme=t}}catch(e){}requestAnimationFrame(function(){requestAnimationFrame(function(){d.classList.add("theme-ready")})})})();`;
