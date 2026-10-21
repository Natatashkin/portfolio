# Theming

Status: done (documented after implementation)

## Goal

The site has a light and a dark theme. It follows the system preference until the visitor chooses a theme, and the
chosen theme is applied before the first paint, so there is no flash.

## Requirements

- [x] Colors are CSS custom properties in `styles/_tokens.scss` (`--color-*`); components use the tokens, not literals.
- [x] Without a stored choice the theme follows `prefers-color-scheme`; the dark palette applies unless
      `data-theme="light"` is set.
- [x] `<html data-theme="light|dark">` forces a theme over the system preference; `color-scheme` is set with it (in the
      palettes and as an inline style), so native controls and scrollbars match.
- [x] The choice is stored in `localStorage` under the key `theme` (`light` or `dark`). `system` is the absence of the
      key. Any other stored value is treated as `system`.
- [x] A constant inline script (`themeScript`) in `<head>` applies the stored theme before the first paint. It is the
      only inline script and receives no CMS data.
- [x] Theme transitions (`body` background and color, 0.2s) are off until the class `theme-ready` is added after two
      animation frames, so the first paint does not animate. They apply only under
      `prefers-reduced-motion: no-preference`.
- [x] `useTheme()` returns `{ theme, setTheme }` (`theme` is `light`, `dark` or `system`). `setTheme` stores, applies to
      `<html>` and notifies every subscriber in the page.
- [x] A change of `theme` in another tab (or clearing the storage) is applied to the current page.
- [x] Without JS the page follows the system preference through CSS; the stored choice is not applied.
- [x] If `localStorage` throws (private mode, blocked site data), reading falls back to `system` and writing is skipped;
      the choice still applies to the current page, but is not remembered.

## Design

- **Tokens:** `light-palette` and `dark-palette` mixins hold the colors once. `:root` includes the light palette;
  the dark one is included under `@media (prefers-color-scheme: dark)` for `:root:not([data-theme='light'])` and for
  `:root[data-theme='dark']`. Spacing, radius, type scale and `--transition-base` live in the same `:root`.
- **Logic:** `lib/theme/theme.ts` has `readStoredTheme`, `storeTheme`, `applyTheme`, `enableThemeTransitions`,
  `restoreTheme` and `themeScript`. `themeScript` repeats the read and apply logic as a string because it cannot import
  modules; a comment in `theme.ts` says both must change together.
- **Hook:** `hooks/useTheme.ts` is a `useSyncExternalStore` over `readStoredTheme`, with a module-level listener set
  (`subscribeToTheme`) and a `storage` event listener. The server snapshot is `system`, since the server never knows the
  stored theme.
- **Layout:** `[locale]/layout.tsx` renders `ThemeScript` in `<head>` and sets `suppressHydrationWarning` on `<html>`,
  because the script changes `data-theme`, `style` and `class` before hydration.
- **Related:** the switcher UI, `useSystemTheme`, `ThemeScript`/`restoreTheme` and keeping the theme across a
  soft language switch are in [theme-switcher.md](theme-switcher.md). Rationale for `localStorage` over a cookie:
  [D5](../decisions.md). Product rules: [theming-and-motion](../specs/theming-and-motion.md).

## Files

- `app/src/styles/_tokens.scss`: palettes, scale, spacing, radius tokens and the dark-mode selectors.
- `app/src/styles/globals.scss`: `body` uses the tokens; `theme-ready` transition, gated by reduced motion.
- `app/src/lib/theme/theme.ts`: storage key, types, read/store/apply helpers, `themeScript`.
- `app/src/hooks/useTheme.ts`: `useTheme`.
- `app/src/app/[locale]/layout.tsx`: mounts `ThemeScript` in `<head>`.

## Acceptance criteria

- [x] A stored `light` or `dark` is on `<html>` (`data-theme`, `color-scheme`) from the script, before hydration.
- [x] `system` removes `data-theme` and the inline `color-scheme`.
- [ ] No flash of the wrong theme on a hard reload, in both themes.
- [ ] Works with storage blocked, and with JS disabled.
- [ ] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`.

## Tasks

Done in the code.

## Open questions

- Not checked in a browser: no flash on reload, behavior with storage blocked and without JS, and contrast of every
  token pair in both palettes.
- The switcher button is a client component, so it needs JS: without JS it is shown but does nothing. Hide it without
  JS, or accept it?
