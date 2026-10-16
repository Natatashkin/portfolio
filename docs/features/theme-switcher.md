# Theme switcher

Status: done, with a caveat: a real screen reader check is deferred

## Goal

The theme switcher shows the theme a click leads to, not the current one, and the theme the visitor chose survives a
language switch.

## Requirements

Requirements are the author's decisions; implementation choices agreed with the author are labelled as such. Ticked
means seen in the code and checked in Chrome (dev server, system theme dark in one session and light in another;
mobile layout of about 844 px, the burger-menu copy of the switcher); unticked items give the reason.

The label is chosen by CSS and the `aria-label` is set only after mount (see Design, "Label chosen by CSS"). The
author re-checked the label-dependent items in the browser after that change (see Acceptance criteria).

### Theme switcher label

- [x] **Author's decision:** the label shows the theme the next click switches to. While the theme is `system`, it
      shows the opposite of the system's effective theme (system dark -> `Light`; system light -> `Dark`). Built: CSS
      shows `Light` under `html[data-theme='dark']` and, without `data-theme`, under `prefers-color-scheme: dark`
      (`ThemeSwitcher.module.scss:6-14,31-40`); otherwise `Dark`. Checked in the browser by the author after the CSS-label change.
- [x] Themes stay `light`, `dark` and `system` (`Theme` in `lib/theme/theme.ts:4`).
- [x] Labels come from `messages/` in both locales (`ThemeSwitcher.light`/`dark`; both rendered in the server HTML,
      `ThemeSwitcher.tsx:33-38`).
- [x] **Decision:** the button is in the server HTML with a label from the first paint: both labels are rendered
      and CSS shows one, so there is no empty or `aria-hidden` placeholder before hydration. Built
      (`ThemeSwitcher.tsx:28-38`, `ThemeSwitcher.module.scss`); the first paint is in the acceptance criteria below.
- [x] **Decision:** the label shown by CSS and the click target chosen by JS always agree. Both read the same
      sources: `<html data-theme>` (set by the inline script before first paint, from the stored theme) and the system
      preference (`useTheme` + `useSystemTheme`, `ThemeSwitcher.tsx:17-22`). An explicit `data-theme` wins over the
      system preference (`:not([data-theme])` in the media query, `ThemeSwitcher.module.scss:35-40`). Checked by the author in the
      browser per theme/system combination and after an OS theme change.
- [x] **Decision:** the accessible name follows the pattern "Switch theme to: Light": the visible target theme word
      is part of the name (WCAG 2.5.3 label in name). The pattern is localized in `messages/{en,uk}.json` with a
      `{theme}` placeholder (`ThemeSwitcher.tsx:39-41`, `en.json:12`, `uk.json:12`). The `aria-label` is set only
      after mount (`useIsMounted`); before mount it is `undefined` and the name is the visible label text. Checked by the
      author in the browser in both locales ("Перемкнути тему: Темна", "Switch theme to: Light").
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

- effective theme = `theme` if `light`/`dark`, otherwise `useSystemTheme()` (`ThemeSwitcher.tsx:21`).
- Target = the opposite of the effective theme (`ThemeSwitcher.tsx:22`); `aria-label` =
  `t('switchTo', { theme: t(target) })` once mounted (`ThemeSwitcher.tsx:39-41`). The visible label is no longer
  computed from the target in JS; see "Label chosen by CSS".
- Click: `setTheme(target === systemTheme ? 'system' : target)` (`ThemeSwitcher.tsx:25-26`). If the target equals the
  system's theme the key is removed (`theme.ts:19-22`), so `system` stays a real third state in storage and in
  `useTheme`. Checked in Chrome: the `system` -> light -> `system` toggle stores `system` (removes the key) when the
  target equals the system theme.
- `useSystemTheme` (`hooks/useSystemTheme.ts`): `useSyncExternalStore` over `matchMedia(DARK_QUERY)` (the
  query string lives in `lib/constants.ts`) with a `change` listener (`subscribeToSystemTheme`); the server snapshot
  is `light`. `canMatchMedia` guards `window.matchMedia`: without it the hook returns `light` and subscribes to nothing.

### Label chosen by CSS

Reason: the earlier version rendered a same-size `aria-hidden` placeholder until hydration, because the stored theme is
unknown on the server (`useTheme.ts:32`), so the button appeared only after hydration. Replaced by:

- Both labels render in the server HTML as two spans, `themeSwitcher__toLight` (`t('light')`) and
  `themeSwitcher__toDark` (`t('dark')`), passed as `label` to `Button` (`ThemeSwitcher.tsx:33-38`). `Button`'s `label`
  type is widened from `string` to `ReactNode` (`Button/types.ts:6`); `Button.tsx` changed by a comment only.
- CSS shows one span. By default the `Dark` span is shown (`ThemeSwitcher.module.scss:22-28`). The `Light` span is shown
  under `html[data-theme='dark']` (`:31-33`) and under `html:not([data-theme])` inside
  `@media (prefers-color-scheme: dark)` (`:36-40`), both through the mixin `show-light-label` (`:6-14`). An explicit
  `data-theme` wins over the system preference, because the media rule applies only without one.
- Decision: the label is chosen by CSS from `data-theme`, which the inline script sets before first paint
  (`theme.ts:59-61`; for `system` it sets nothing), so there is no flash. Not measured in a browser yet.
- Click target stays in JS (`useTheme` + `useSystemTheme`). Label (CSS) and click (JS) read the same sources and must
  always agree. This coupling is a risk: a change to one side must change the other.
- Accessible name: `aria-label` is set only after mount (`useIsMounted`). Before mount it is `undefined` and the name is
  the visible label text. Because the hidden span is `display: none`, it is left out of the name; this is expected from
  CSS behavior, not checked with an accessibility tree.

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
  `matchMedia`, the system theme is `light` (`canMatchMedia`, `getSnapshot` and `getServerSnapshot` in `useSystemTheme.ts`).

### Ownership

This feature owns `useTheme`, `useSystemTheme`, `lib/theme/theme.ts`, `ThemeScript` and the label logic. The final
theme switcher design stays undecided (see [../roadmap.md](../roadmap.md), "Final theme switcher design").

## Files

- `app/src/components/ui/ThemeSwitcher/ThemeSwitcher.tsx`: click target and post-mount `aria-label` from the effective
  theme; both labels as spans.
- `app/src/components/ui/ThemeSwitcher/ThemeSwitcher.module.scss`: shows one of the two label spans by `data-theme` and
  `prefers-color-scheme`.
- `app/src/components/ui/Button/types.ts`: `label` widened to `ReactNode`. `Button.tsx`: comment only.
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
- [x] Theme switcher accessible name is "Switch theme to: <visible word>" in the page language, from messages, after
      mount; before mount it is the visible label text. The `ThemeSwitcher.system` key is gone from both message files
      (keys checked in the files). Checked by the author in the browser. A real screen reader is a separate unticked
      requirement above.
- [x] Theme `system`, system dark: label `Light`; click sets light. System light: label `Dark`; click sets dark.
      Checked by the author in the browser with the CSS label, for both system themes.
- [x] Theme `light`: label `Dark`; `dark`: label `Light`. With the agreed toggle variant, switching to the system's
      own theme stores `system`. Checked by the author in the browser with the CSS
      label: stored `light` and `dark` on a light and a dark system, and the click to the system's own theme.
- [x] With the agreed toggle variant, changing the OS theme while the theme is `system` updates the label without
      reload. Checked by the author in the browser: the label changes through the media
      query, the click target through `useSystemTheme`.
- [x] No empty button before hydration, no flash of the wrong label at first paint, and no hydration warning from the
      switcher. Checked by the author in the browser after the CSS-label change: the label is there from the
      first frame, and no hydration warning in the dev console. The Next dev overlay showed a console error from the React DevTools
      extension on the first theme change (see [header.md](header.md), Open questions); it is not a hydration warning.
- [x] Renders in `en` and `uk`, light and dark, mobile and desktop. Checked by the author in the browser, including the button width on a theme change and
      the burger-menu copy. Earlier I also checked `en` and `uk` on the desktop and the mobile layout (about 844 px).
- [x] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`. Re-run after the CSS-label change:
      all pass.

## Tasks

1. Block 1 (known defect): keep the theme across a language switch. Built: `restoreTheme` in a layout effect of
   `ThemeScript` (moved there from `useTheme` after review) and the script rendered only before mount; verified in
   Chrome (see Acceptance criteria).
2. Block 2: system theme subscription and the effective-theme toggle in `ThemeSwitcher`; new labels, the
   "Switch theme to: {theme}" aria-label and messages; `ThemeSwitcher.system` removed. Built and checked in Chrome.
3. Block 3b: replace the `aria-hidden` placeholder with two CSS-chosen labels (`ThemeSwitcher.module.scss`,
   `Button` `label` as `ReactNode`; `aria-label` only after mount). Built, `pnpm format`, `pnpm code-quality` and `pnpm build` pass,
   and the author checked it in the browser (label per theme and system preference, accessible name, first paint with
   no empty button, button width, OS theme change).
4. Block 3 (done before block 4, checked against the placeholder version): the manual checks were done by the author (OS theme change while the page is open, no hydration warning with a
   stable placeholder, the desktop and mobile layouts in both locales and themes; the author also saw no flash on
   the theme remount). Remaining, deferred to a separate stage by the author: a real screen reader. Then set the
   status to `done`.

## Open questions

- None open on the design. Resolved: where to re-apply the stored theme. It is `ThemeScript`, a single mount point in
  the root layout (per the review), not `useTheme` (which would run once per `ThemeSwitcher` copy) and not
  `LanguageAnnouncer`; `<html>` does not carry `data-theme` through React props.
- Placement of the fix in this feature (block 1): resolved, it stayed here.
- Console error from React DevTools (development only): moved to [header.md](header.md), Open questions. The cause is
  duplicated `SocialLinks` in the burger panel and the footer, not the theme switcher.
