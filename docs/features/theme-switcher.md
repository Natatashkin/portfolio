# Theme switcher

Status: done, with caveats: a real screen reader check is deferred

## Goal

The theme switcher shows the theme a click leads to, not the current one, and the theme the visitor chose survives a
language switch.

## Requirements

Requirements are the author's decisions; implementation choices agreed with the author are labelled as such.

- [x] The label shows the theme the next click switches to. While the theme is `system`, it shows the opposite of the
      system's effective theme (system dark -> `Light`; system light -> `Dark`).
- [x] Themes stay `light`, `dark` and `system` (`Theme` in `lib/theme/theme.ts`).
- [x] Labels come from `messages/` in both locales (`ThemeSwitcher.light` / `dark`). Both are rendered in the server
      HTML and CSS shows one, so the button has its label from the first paint: no empty or `aria-hidden` placeholder
      before hydration.
- [x] The label shown by CSS and the click target chosen by JS always agree. Both read the same sources: `<html data-theme>`
      (set by the inline script before first paint) and the system preference. An explicit `data-theme` wins over the
      system preference.
- [x] The accessible name is "Switch theme to: Light": the visible target word is part of the name (WCAG 2.5.3).
      The pattern is localized in `messages/{en,uk}.json` with a `{theme}` placeholder. The `aria-label` is set only
      after mount; before mount the name is the visible label text.
- [x] The message key `ThemeSwitcher.system` is removed; the label never shows "system".
- [x] Keyboard focus shows the same centre-growing underline as the language switcher (`muted-control` in
      `styles/_mixins.scss`) instead of the `Button` focus ring. The mixin keeps a transparent 2px outline so the ring
      stays visible in forced-colors mode.
- [x] **Agreed implementation variant:** a two-way toggle on the effective theme (see Design).
- [x] The theme the visitor chose stays applied to `<html>` (`data-theme`, `color-scheme`) after a soft language
      switch.

## Design

### Toggle

- Effective theme = `theme` if `light` or `dark`, otherwise `useSystemTheme()`. The target is its opposite, and the
  `aria-label` is built from the target.
- Click: `setTheme(target === systemTheme ? 'system' : target)`. When the target equals the system theme the storage
  key is removed, so `system` stays a real third state in storage and in `useTheme`.
- `useSystemTheme` (`hooks/useSystemTheme.ts`): `useSyncExternalStore` over `matchMedia` with a `change` listener
  (`subscribeToSystemTheme`); the server snapshot is `light`. `canMatchMedia` guards `window.matchMedia`: without it the
  hook returns `light` and subscribes to nothing.

### Label chosen by CSS

The stored theme is unknown on the server, so a JS-chosen label would need a placeholder until hydration. Instead:

- Both labels render as two spans (`themeSwitcher__toLight`, `themeSwitcher__toDark`) passed as `label` to `Button`,
  whose `label` type is `ReactNode`.
- CSS shows `Dark` by default, and `Light` under `html[data-theme='dark']` and under `html:not([data-theme])` inside
  `@media (prefers-color-scheme: dark)`. The inline script sets `data-theme` before first paint, so there is no flash.
- The click target stays in JS. Label (CSS) and click (JS) must always agree: a change to one side must change the
  other. This coupling is the main risk of the design.
- The hidden span is `display: none`, so it is left out of the accessible name.

### Theme after a soft locale switch

The locale switch is a soft navigation (D14 in [../decisions.md](../decisions.md)). React remounts the root layout
subtree and removes the attributes it does not own from `<html>`: `data-theme`, `color-scheme` (the `style`) and the
`theme-ready` class. The inline `themeScript` only runs on a document load, so the theme was lost until a reload, and
rendering the `<script>` again on the client logged a React error.

Fix (`themeScript` itself is unchanged):

1. `restoreTheme()` in `lib/theme/theme.ts` applies the stored theme and enables theme transitions (`theme-ready`
   after a double `requestAnimationFrame`). It is called from a `useLayoutEffect` in `ThemeScript`, so it runs before
   paint once per mount of the root layout.
2. `ThemeScript` renders the inline script only while `useIsMounted()` is false (server render and hydration) and
   `null` afterwards, so React no longer logs the script error. The script still arrives in the server HTML and
   still sets the theme before first paint.

`themeScript` repeats `applyTheme` as a string because it cannot import modules; a comment next to `applyTheme` says
both must change together. The language switcher ([language-switcher.md](language-switcher.md)) triggers the remount
but does not re-apply the theme; the fix belongs here.

### UI and server/client split

- `ThemeSwitcher` is a client component; `ThemeScript` is a client component that renders in the server HTML.
- **Edge cases:** storage failure falls back to `system`; on the server, and in a browser without `matchMedia`, the
  system theme is `light`.

### Ownership

This feature owns `useTheme`, `useSystemTheme`, `lib/theme/theme.ts`, `ThemeScript` and the label logic.

## Decisions

- Two-way toggle on the effective theme instead of keeping the three-step cycle `system -> light -> dark` and only
  relabelling it: from `system` the next step is always `light`, so on a light system theme the label would read
  `Light` for a click that changes nothing visible. The toggle costs a `matchMedia` subscription.

## Files

- `app/src/components/ui/ThemeSwitcher/ThemeSwitcher.tsx`: click target and post-mount `aria-label` from the effective
  theme; both labels as spans.
- `app/src/components/ui/ThemeSwitcher/ThemeSwitcher.module.scss`: shows one of the two label spans by `data-theme` and
  `prefers-color-scheme`.
- `app/src/components/ui/Button/types.ts`: `label` is `ReactNode`.
- `app/src/hooks/useSystemTheme.ts`: system theme subscription, guarded by `canMatchMedia`.
- `app/src/lib/theme/theme.ts`: `enableThemeTransitions`, `restoreTheme`, `themeScript`.
- `app/src/components/layout/ThemeScript/`: inline script on server render and hydration only; `useLayoutEffect`
  calling `restoreTheme` once per mount of the root layout.
- `app/src/app/[locale]/layout.tsx`: renders `<ThemeScript />` in `<head>`.
- `app/messages/en.json`, `uk.json`: `ThemeSwitcher.switchTo` added; `ThemeSwitcher.system` removed.

## Acceptance criteria

- [x] The theme chosen before a soft language switch is still on `<html>` (`data-theme`, `color-scheme`) after it, in
      both directions, and the React "script tag" error no longer appears.
- [x] With the theme `system`, changing the OS theme updates the label without a reload.
- [x] No empty button before hydration, no flash of the wrong label at first paint, and no hydration warning from the
      switcher.
- [x] Renders in `en` and `uk`, light and dark, mobile and desktop.
- [x] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`.

## Tasks

Done in the code.

## Open questions

- A real screen reader check of the accessible name is deferred by the author's decision, to a separate stage.
