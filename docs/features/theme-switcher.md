# Theme switcher

Status: done, with a caveat: a real screen reader check is deferred

## Goal

The theme switcher shows the theme a click leads to, not the current one, and the theme the visitor chose survives a
language switch.

## Requirements

Requirements are the author's decisions; implementation choices agreed with the author are labelled as such. Ticked
means seen in the code and checked in Chrome (dev server, system theme dark in one session and light in another;
mobile layout of about 844 px, the burger-menu copy of the switcher); unticked items give the reason.

### Theme switcher label

- [x] **Author's decision:** the label shows the theme the next click switches to. While the theme is `system`, it
      shows the opposite of the system's effective theme (system dark -> `Light`; system light -> `Dark`).
      (`ThemeSwitcher.tsx:19-20,35`.) Checked in Chrome for both: system dark gives `Light`/`Світла`, system light gives
      `Dark`/`Темна`.
- [x] Themes stay `light`, `dark` and `system` (`Theme` in `lib/theme/theme.ts:4`).
- [x] Labels come from `messages/` in both locales (`ThemeSwitcher.light`/`dark`).
- [x] **Decision:** the accessible name follows the pattern "Switch theme to: Light": the visible target theme word
      is part of the name (WCAG 2.5.3 label in name). The pattern is localized in `messages/{en,uk}.json` with a
      `{theme}` placeholder (`ThemeSwitcher.tsx:36`, `en.json:12`, `uk.json:12`). The accessible name was seen in
      Chrome in both locales ("Перемкнути тему: Темна", "Switch theme to: Light").
- [ ] The name is announced correctly by a real screen reader. Deferred (author's decision): none was used; to be done in a separate stage.
- [x] **Decision:** the message key `ThemeSwitcher.system` is removed from `messages/en.json` and `uk.json`; the label
      never shows "system", to avoid confusing users.
- [x] **Agreed implementation variant** (a design choice agreed with the author, not an original requirement): a
      two-way toggle on the effective theme; see Design, "Theme switcher toggle".

### Theme survives a language switch

- [x] The theme the visitor chose stays applied to `<html>` (`data-theme`, `color-scheme`) after a soft language
      switch. Checked in Chrome: `uk` -> `en` with stored `light`, `en` -> `uk` with `system`, and `uk` -> `en` and
      back with stored `dark` (`data-theme` and `color-scheme` stayed `dark`, `theme-ready` present). See Design,
      "Theme lost after a soft locale switch (fixed)".

## Design

### State before block 1

Audited before the work: the code was the original placeholder. The label was `t(theme)` and showed the **current**
theme; the cycle was `system -> light -> dark -> system`; there was no `switchTo` key; the `ThemeSwitcher.system` key
was present; there was no system-theme subscription; the locale-switch defect was present.

### Theme switcher toggle

Author's decision (requirement): the label shows the theme the next click switches to; for `system` it shows the
opposite of the system's effective theme.

**Agreed implementation variant** (design choice agreed with the author): a two-way toggle on the **effective** theme.
Built in `ThemeSwitcher.tsx`:

- effective theme = `theme` if `light`/`dark`, otherwise `useSystemTheme()` (`ThemeSwitcher.tsx:19`).
- Target = the opposite of the effective theme; label = `t(target)`; `aria-label` = `t('switchTo', { theme: t(target) })`
  (`ThemeSwitcher.tsx:20,35-36`).
- Click: `setTheme(target === systemTheme ? 'system' : target)` (`ThemeSwitcher.tsx:23-24`). If the target equals the
  system's theme the key is removed (`theme.ts:19-22`), so `system` stays a real third state in storage and in
  `useTheme`. Checked in Chrome: the `system` -> light -> `system` toggle stores `system` (removes the key) when the
  target equals the system theme.
- `useSystemTheme` (`hooks/useSystemTheme.ts`): `useSyncExternalStore` over `matchMedia('(prefers-color-scheme: dark)')`
  with a `change` listener (`subscribeToSystemTheme`); the server snapshot is `light`. `canMatchMedia`
  (`useSystemTheme.ts:9`) guards `window.matchMedia`: without it the hook returns `light` and subscribes to nothing.
- Before mount a same-size `aria-hidden` placeholder renders (`ThemeSwitcher.tsx:27-31`), because the stored theme is
  unknown on the server (`useTheme.ts:32`).

Alternative not chosen: keep the three-step cycle `system -> light -> dark` and only change the label to the next
step. From `system` the next step is always `light`, so with a light system theme the label would read `Light` for a
click that changes nothing visible, which is at odds with the "opposite of the effective theme" label the author
wants. The toggle avoids that at the cost of the `matchMedia` subscription.

### Theme lost after a soft locale switch (fixed)

**Defect (verified in Chrome before the fix).** With `localStorage` `theme=light` and
`<html data-theme="light" style="color-scheme: light">`, after switching language `data-theme` and `color-scheme` were
gone while `localStorage` still said `light`; the page rendered with the system theme until a reload. The dev console
showed the React error "Encountered a script tag while rendering React component. Scripts inside React components are
never executed when rendering on the client" (the "1 Issue" badge in the Next dev overlay).

**Root cause (confirmed in Chrome).** On a soft locale switch the `<html>` DOM node stays the same (identity checked),
but React remounts the root layout subtree and removes the attributes it does not own from `<html>`. A
`MutationObserver` showed `data-theme` removed, `style` (color-scheme) removed and `class` reset to only the font
variable class, so `theme-ready` is lost too (the `lenis` class is re-added by Lenis). The inline `themeScript` only
runs on a document load. The script error came from the layout rendering `<script>` again on the client.

**Fix (least invasive; `themeScript` itself is unchanged).**

1. `restoreTheme()` in `lib/theme/theme.ts:52-55` = `applyTheme(readStoredTheme())` + `enableThemeTransitions()`
   (double `requestAnimationFrame` adding `theme-ready`, `theme.ts:41-47`). It is called from a
   `useLayoutEffect(() => restoreTheme(), [])` in `ThemeScript` (`ThemeScript.tsx:20-22`), so it runs before paint
   after the remount, once per mount of the root layout and not once per `ThemeSwitcher` copy (the header renders
   more than one, including the burger-menu copy). No frame in the wrong theme is expected, but this was not
   measured. The initial load runs it too, idempotently. `useTheme` does not import `restoreTheme`.
2. The same `ThemeScript` client component (`components/layout/ThemeScript/ThemeScript.tsx`) renders the inline script
   only while `useIsMounted()` is false (server render and hydration) and `null` on any later client render, so React
   no longer logs the script error. The script still arrives in the server HTML (checked with curl on `/uk`) and
   still sets the theme before the first paint. `[locale]/layout.tsx:44` renders `<ThemeScript />` in `<head>`.

Single mount point: the restore does not depend on a `ThemeSwitcher` being rendered, because `ThemeScript` is in the
root layout. `themeScript` repeats `applyTheme` as a string because it cannot import modules; a comment next to
`applyTheme` (`theme.ts:28`) says both must change together.

Trigger relation: the language switcher ([language-switcher.md](language-switcher.md)) is what triggers the remount,
because the locale switch is a soft navigation (D14 in [../decisions.md](../decisions.md)). The fix belongs here; the
language switcher does not re-apply the theme.

### Labels and strings

- Theme labels: `ThemeSwitcher.light` / `dark` (`app/messages/en.json:13-14`, `uk.json:13-14`: "Light"/"Dark",
  "Світла"/"Темна").
- Accessible name (decision): `aria-label` "Switch theme to: {theme}" / "Перемкнути тему: {theme}", `{theme}` being the
  visible label word, so the visible text is part of the name (`switchTo`, `en.json:12`, `uk.json:12`).
- `ThemeSwitcher.system` is removed from both files.

### UI and server/client split

- `ThemeSwitcher` is a client component; `ThemeScript` is a client component that renders in the server HTML.
- **Edge cases:** storage failure falls back to `system` (`theme.ts:10-17`); on the server, and in a browser without
  `matchMedia`, the system theme is `light` (`useSystemTheme.ts:9,20,23`).

### Ownership

This feature owns `useTheme`, `useSystemTheme`, `lib/theme/theme.ts`, `ThemeScript` and the label logic. The final
theme switcher design stays undecided (see [../roadmap.md](../roadmap.md), "Final theme switcher design").

## Files

- `app/src/components/ui/ThemeSwitcher/ThemeSwitcher.tsx`: label and click target from the effective theme.
- `app/src/hooks/useSystemTheme.ts` (new): system theme subscription, guarded by `canMatchMedia`.
- `app/src/lib/theme/theme.ts`: `enableThemeTransitions`, `restoreTheme` added; `themeScript` unchanged; comment on
  `applyTheme` that `themeScript` repeats it.
- `app/src/components/layout/ThemeScript/` (new: `ThemeScript.tsx`, `index.ts`): inline script only on server render
  and hydration; `useLayoutEffect` calling `restoreTheme` once per mount of the root layout.
- `app/src/app/[locale]/layout.tsx`: renders `<ThemeScript />` in `<head>`.
- `app/messages/en.json`, `uk.json`: `ThemeSwitcher.switchTo` added; `ThemeSwitcher.system` removed.

## Acceptance criteria

- [x] The theme chosen before a soft language switch is still on `<html>` (`data-theme`, `color-scheme`) after it, in
      both directions, and the "script tag" React error no longer appears. Checked: `uk` -> `en` with stored `light`
      (same `<html>` node, `data-theme` and `color-scheme` light, `theme-ready` present, no script error in the
      console); `en` -> `uk` with `system` (stays system, `theme-ready` present); `uk` -> `en` and `en` -> `uk` with
      stored `dark` (still `dark`/`dark`, `theme-ready` present, hash `#hero` kept, `window` marker alive).
- [x] Theme switcher accessible name is "Switch theme to: <visible word>" in the page language, from messages. The
      `ThemeSwitcher.system` key is gone from both message files. Checked: the attribute in `uk` ("Перемкнути тему:
      Світла", "Перемкнути тему: Темна") and `en` ("Switch theme to: Dark", "Switch theme to: Light"), keys in the
      files. A real screen reader is a separate unticked requirement above.
- [x] Theme `system`, system dark: label `Light`; click sets light. System light: label `Dark`; click sets dark.
      Checked for both: system dark (label `Світла`, click stores `light`) and system light (name "Перемкнути тему:
      Темна"; click stored `dark`, `data-theme` and `color-scheme` `dark`, label then "Світла").
- [x] Theme `light`: label `Dark`; `dark`: label `Light`. With the agreed toggle variant, switching to the system's
      own theme stores `system`. Checked: `light` (system dark) -> label `Темна`; click to the system's dark removed
      the stored key and `data-theme`; the next click gave `light` again; stored `dark` (system light) -> label
      `Світла`/`Light`.
- [x] With the agreed toggle variant, changing the OS theme while the theme is `system` updates the label without
      reload. Checked manually by the author.
- [x] No hydration warning from the switcher; the placeholder keeps the layout stable. Checked manually by the author;
      no hydration warning was seen in the dev console either. The Next dev overlay showed a console error from the
      React DevTools extension on the first theme change (see Open questions); it is not a hydration warning.
- [x] Renders in `en` and `uk`, light and dark, mobile and desktop. Checked manually by the author; I also checked
      `en` and `uk` on the desktop (earlier session) and the mobile layout (about 844 px) in `uk` and `en`, including
      the burger-menu copy.
- [x] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`. (`code-quality`
      and `build` were run and pass; `pnpm format` is run by the main session at hand-off.)

## Tasks

1. Block 1 (known defect): keep the theme across a language switch. Built: `restoreTheme` in a layout effect of
   `ThemeScript` (moved there from `useTheme` after review) and the script rendered only before mount; verified in
   Chrome (see Acceptance criteria).
2. Block 2: system theme subscription and the effective-theme toggle in `ThemeSwitcher`; new labels, the
   "Switch theme to: {theme}" aria-label and messages; `ThemeSwitcher.system` removed. Built and checked in Chrome.
3. Block 3: the manual checks were done by the author (OS theme change while the page is open, no hydration warning with a
   stable placeholder, the desktop and mobile layouts in both locales and themes; the author also saw no flash on
   the theme remount). Remaining, deferred to a separate stage by the author: a real screen reader. Then set the
   status to `done`.

## Open questions

- None open on the design. Resolved: where to re-apply the stored theme. It is `ThemeScript`, a single mount point in
  the root layout (per the review), not `useTheme` (which would run once per `ThemeSwitcher` copy) and not
  `LanguageAnnouncer`; `<html>` does not carry `data-theme` through React props.
- Placement of the fix in this feature (block 1): resolved, it stayed here.
- Console error from React DevTools (development only, not fixed in code). Observed in the mobile layout with the
  burger menu open: the first theme change after a page load made the Next dev overlay show "1 Issue: Console Error:
  The children should not have changed if we pass in the same set." with a call stack of about 50 frames, all in
  `chrome-extension://<React DevTools id>/build/installHook.js` (`updateFiberRecursively`,
  `updateVirtualChildrenRecursively`, `updateChildrenRecursively`). Wrapping
  `__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot` and catching the throw showed every frame inside the extension;
  React only logs it ("React instrumentation encountered an error") in development. The theme change still applied
  (stored `dark`, `data-theme` `dark`). Reproduced twice with the menu open and the first change after load; not
  reproduced with the menu closed (burger copy clicked by script) and not on later changes. So the exception is
  thrown by the DevTools extension's commit hook while it walks the fiber tree, not by the app code, and production
  React does not log it. Why the extension throws is not known. Proposed check for the author: disable the extension
  and repeat.
