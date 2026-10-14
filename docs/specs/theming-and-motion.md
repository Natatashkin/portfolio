# Theming and motion

## Styling

- SCSS Modules (`sass`). Design tokens are CSS custom properties in `styles/_tokens.scss`: bg, surface, border, text,
  text-muted, primary, secondary, accent (+ on-colors, accent-ink), radius, spacing. SCSS holds no color values.
- `styles/_mixins.scss` is a Sass partial kept minimal (breakpoints, focus ring, visually-hidden, `muted-control` for the switchers). Breakpoints are SCSS
  variables because custom properties do not work in media queries. Modules load it with `@use 'mixins' as *;`
  (`sassOptions.loadPaths` points at `src/styles`).
- BEM per module in camelCase: block `.hero`, element `.hero__stackItem`, modifier `.linkButton--accent`; no
  element-of-element chains.
- Font: Montserrat only (`next/font/google`, latin + cyrillic, `--font-montserrat`).

## Themes

- Light (white) and dark (very deep black). Default follows `prefers-color-scheme`.
- Manual override: `data-theme` on `<html>` plus `color-scheme`, stored in `localStorage` key `theme`
  (`light` | `dark`; no value = system). No cookie, so pages stay static.
- A constant inline script (`themeScript`) in `<head>` applies the stored theme before first paint; `<html>` carries
  `suppressHydrationWarning`. Storage access is wrapped in try/catch and falls back to system.
- Soft locale switch (resolved): React remounts the root layout subtree and removes the attributes it does not own from
  `<html>` (`data-theme`, `color-scheme`, `theme-ready`), and the script only runs on a document load.
  `ThemeScript` (root layout, a single mount point) calls `restoreTheme()` in a `useLayoutEffect` on mount to put them
  back before paint, and renders the script only on the server and during hydration, so React logs no
  client-rendered script error. Details:
  [features/theme-switcher.md](../features/theme-switcher.md).
- `useTheme`, `useSystemTheme` and `ThemeSwitcher` exist; the switcher is a two-way toggle on the effective theme with
  the label of the target theme, chosen by CSS from `data-theme` / `prefers-color-scheme` (both labels are in the server
  HTML). Its final design is undecided.

## Motion (Lenis + GSAP)

- Client-only. Never touch `window`/`document` during server rendering.
- One Lenis instance, created in `SmoothScrollProvider`, driven by `gsap.ticker`
  (`lagSmoothing(0)`, `autoRaf: false`) so Lenis and ScrollTrigger share one loop.
- Lenis is connected to ScrollTrigger through `useLenis(() => ScrollTrigger.update())` in the private
  `ScrollTriggerSync` child (the equivalent of `lenis.on('scroll', ScrollTrigger.update)`, which the Lenis docs require
  for GSAP ScrollTrigger). A child is needed because the instance only exists inside `ReactLenis`, and the hook
  unsubscribes on unmount.
- Plugins registered once, client-side. Use `useGSAP` (or `gsap.context`) so tweens and ScrollTriggers clean up.
- Animate `transform` and `opacity` only; never layout properties.
- `prefers-reduced-motion`: no Lenis smoothing and no non-essential motion (`gsap.matchMedia` for GSAP code).
- Call `ScrollTrigger.refresh()` after async content changes page height.
- A custom cursor, if ever added, is disabled for `(pointer: coarse)` and reduced motion.

## Accessibility

Skip link and `main#main-content`, landmark labels from `messages/`, visible focus ring mixin, alt text from
`responsiveImage.alt`, keyboard-operable burger menu.
