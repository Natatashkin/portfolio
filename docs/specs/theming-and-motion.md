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
  HTML).

## Motion (Lenis + GSAP)

Procedure and traps: the `scroll-animation` skill (`.claude/skills/scroll-animation/SKILL.md`). Wiring and edge cases:
[features/smooth-scroll.md](../features/smooth-scroll.md); reasons: D10 in [../decisions.md](../decisions.md).

- Client-only. Never touch `window`/`document` during server rendering.
- One Lenis instance, created in `SmoothScrollProvider` with its own `requestAnimationFrame` loop (`autoRaf`), in the
  first bundle. It is not driven from `gsap.ticker`.
- GSAP and ScrollTrigger are not in the first bundle: get them only through `loadGsap()` (`lib/motion/loadGsap.ts`).
  `SmoothScrollProvider` forwards Lenis scroll to `ScrollTrigger.update` once they are loaded.
- Content is visible without JS: never hide an element in CSS (`opacity: 0`) to reveal it with GSAP. Initial states
  are applied after GSAP is ready, and first-screen motion is CSS.
- Use `useGSAP` (or `gsap.context`) so tweens and ScrollTriggers clean up.
- Animate `transform` and `opacity` only; never layout properties.
- `prefers-reduced-motion`: no Lenis smoothing and no non-essential motion (`gsap.matchMedia` for GSAP code).
  The provider keeps `ReactLenis` mounted (the tree shape must not change) and loads no GSAP, so a section that
  awaits `loadGsap` itself must check the preference.
- Call `ScrollTrigger.refresh()` after async content changes page height.
- A custom cursor, if ever added, is disabled for `(pointer: coarse)` and reduced motion.

## Accessibility

Skip link and `main#main-content`, landmark labels from `messages/`, visible focus ring mixin, alt text from
`responsiveImage.alt`, keyboard-operable burger menu.
