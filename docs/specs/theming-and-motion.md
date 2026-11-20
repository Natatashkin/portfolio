# Theming and motion

## Styling

- SCSS Modules (`sass`). Design tokens are CSS custom properties in `styles/_tokens.scss`: bg, surface, border, text,
  text-muted, primary, secondary, accent (+ on-colors, accent-ink, accent-shine), fonts, radius, spacing. Colors are
  defined only in `_tokens.scss`; modules use `var(--color-*)`.
- `styles/_mixins.scss` is a Sass partial kept minimal (breakpoints, focus ring, visually-hidden, `focused-underline`, `muted-control` for
  the switchers and the social links, `button-variants` and `button-variant-transparent`). Breakpoints are SCSS
  variables because custom properties do not work in media queries. Modules load it with `@use 'mixins' as *;`
  (`sassOptions.loadPaths` points at `src/styles`).
- BEM per module in camelCase: block `.hero`, element `.hero__stack`, modifier `.linkButton--accent`; no
  element-of-element chains.
- Font: Montserrat for text (`next/font/google`, latin + cyrillic, `--font-montserrat`); Caveat as a handwriting accent
  where the design asks for it, never body text (`--font-caveat`, token `--font-handwritten`, weight 600, latin +
  cyrillic, not preloaded; D19).

## Themes

- Light (white) and dark (very deep black). Default follows `prefers-color-scheme`: the dark palette applies unless
  `data-theme="light"` is set. The `light-palette` and `dark-palette` mixins in `_tokens.scss` hold each color once.
- Manual override: `data-theme` on `<html>` plus `color-scheme` (in the palettes and as an inline style, so native
  controls and scrollbars match), stored in `localStorage` key `theme` (`light` | `dark`; no value = system, and any
  other stored value counts as system). No cookie, so pages stay static ([D5](../decisions.md)).
- A constant inline script (`themeScript`) in `<head>` applies the stored theme before first paint; it is the only
  inline script and receives no CMS data. `<html>` carries `suppressHydrationWarning` because the script changes
  `data-theme`, `style` and `class` before hydration. `themeScript` repeats the read/apply logic of
  `lib/theme/theme.ts` as a string (it cannot import), so both must change together.
- Storage access is wrapped in try/catch: if `localStorage` throws, reading falls back to system and writing is
  skipped (the choice applies to the current page but is not remembered). Without JS the page follows the system
  preference through CSS.
- `useTheme()` (`hooks/useTheme.ts`) is a `useSyncExternalStore` over the stored theme: `{ theme, setTheme }`, server
  snapshot `system`; `setTheme` stores, applies and notifies every subscriber, and a `storage` event from another tab
  is applied too.
- Theme transitions (`body` background and color, 0.2s) are off until the class `theme-ready` is added after two
  animation frames, so the first paint does not animate; they apply only under `prefers-reduced-motion: no-preference`.
- Soft locale switch (resolved): React remounts the root layout subtree and removes the attributes it does not own from
  `<html>` (`data-theme`, `color-scheme`, `theme-ready`), and the script only runs on a document load.
  `ThemeScript` (root layout, a single mount point) calls `restoreTheme()` in a `useLayoutEffect` on mount to put them
  back before paint, and renders the script only on the server and during hydration, so React logs no
  client-rendered script error. Details:
  [features/theme-switcher.md](../features/theme-switcher.md).
- `useSystemTheme` and `ThemeSwitcher` exist; the switcher is a two-way toggle on the effective theme with
  the label of the target theme, chosen by CSS from `data-theme` / `prefers-color-scheme` (both labels are in the server
  HTML). It is a client component, so without JS it is shown but does nothing (open: hide it without JS or accept it).
- Known gaps: no browser check yet of the no-flash reload, blocked storage, JS off, or contrast of every token pair in
  both palettes.

## Motion (Lenis + GSAP)

Procedure and traps: the `scroll-animation` skill (`.claude/skills/scroll-animation/SKILL.md`). Reasons: D10 in
[../decisions.md](../decisions.md).

- Client-only. Never touch `window`/`document` during server rendering.
- One Lenis instance, created by `ReactLenis` (`root`, `autoRaf`) in `SmoothScrollProvider`, which wraps the whole body
  content in `[locale]/layout.tsx` (header, page, footer, language announcer). Lenis is a static import in the first
  bundle, with its own `requestAnimationFrame` loop; it is not driven from `gsap.ticker`.
- GSAP and ScrollTrigger are not in the first bundle: get them only through `loadGsap()` (`lib/motion/loadGsap.ts`),
  which dynamically imports both, registers `ScrollTrigger` once and returns one shared promise. A failed import is not
  cached (the next caller retries); the provider swallows it, so smooth scroll works without ScrollTrigger.
- The provider calls `loadGsap` only after `load` and when idle (`requestIdleCallback`, 2000 ms timeout; 200 ms
  `setTimeout` where it is missing), and forwards Lenis scroll to `ScrollTrigger.update` (through `useLenis`) once
  loaded. Unmount or a preference change cancels the pending load and ignores a late import.
- Under reduced motion `ReactLenis` stays mounted with `smoothWheel: false` (touch is native, `syncTouch` is off), and
  GSAP is not loaded; Lenis's own `respectReducedMotion` only makes programmatic scrolls instant. The preference is
  read with `useSyncExternalStore` (server snapshot `false`), so a live change is picked up and the tree never
  remounts. Consequence: with reduced motion on at load, the first client render has `smoothWheel: true` and Lenis is
  rebuilt once after the real snapshot is read.
- The burger menu stops Lenis while open (`lenis.stop()`, `start()` on close), sets `overflow: hidden` on `<html>`, and
  its panel has `data-lenis-prevent` so it scrolls itself (a second Lenis instance would break the one-instance rule).
  If reduced motion is toggled while the menu is open, the new instance starts un-stopped; the `overflow` lock still
  holds. Rare, accepted. See [features/header.md](../features/header.md).
- Content is visible without JS: never hide an element in CSS (`opacity: 0`) to reveal it with GSAP. Initial states
  are applied after GSAP is ready, and first-screen motion is CSS.
- Clean up every tween and ScrollTrigger: `gsap.matchMedia` / `gsap.context` with `revert()` in an effect cleanup (the
  pattern in the `scroll-animation` skill), or `useGSAP` where tweens are created synchronously.
- Animate `transform` and `opacity` only; never layout properties. One exception: the project card blur (`filter`, [projects-section.md](../features/projects-section.md)).
- `prefers-reduced-motion`: no Lenis smoothing and no non-essential motion (`gsap.matchMedia` for GSAP code).
  The provider keeps `ReactLenis` mounted (the tree shape must not change) and loads no GSAP, so a section that
  awaits `loadGsap` itself must check the preference.
- Call `ScrollTrigger.refresh()` after async content changes page height.
- A custom cursor, if ever added, is disabled for `(pointer: coarse)` and reduced motion.
- Open checks: the Lenis one-frame trail with the Experience intro pin (D10 accepts it, not re-checked); anchor
  navigation with Lenis (header links to section ids) is unspecified until a section with an anchor is tested (the
  hash `scrollIntoView` in [features/language-switcher.md](../features/language-switcher.md) is equally untested).

## Accessibility

Skip link and `main#main-content`, landmark labels from `messages/`, visible focus ring mixin, alt text from
`responsiveImage.alt`, keyboard-operable burger menu.
