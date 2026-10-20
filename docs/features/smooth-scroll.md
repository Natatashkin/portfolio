# Smooth scroll

Status: done (documented after implementation)

## Goal

The page scrolls smoothly with one Lenis instance, without costing the first load: GSAP and ScrollTrigger arrive only
when the browser is idle. Visitors who prefer reduced motion get native wheel and touch scrolling, and programmatic
scrolls (anchors) become instant. Rules and rationale:
[../specs/theming-and-motion.md](../specs/theming-and-motion.md#motion-lenis--gsap), decision D10 in
[../decisions.md](../decisions.md).

## Requirements

- [x] One Lenis instance for the whole app, created by `ReactLenis` with `root` and `autoRaf: true` (its own
      `requestAnimationFrame` loop). `SmoothScrollProvider` is the only place that creates it and wraps the whole body
      content (header, page, footer and the language announcer) in `app/src/app/[locale]/layout.tsx`.
- [x] Lenis stays in the first bundle: it is a static import in the client component; `lenis/dist/lenis.css` is
      imported next to it.
- [x] GSAP and ScrollTrigger are not in the first bundle. `loadGsap()` imports both with dynamic `import()`, registers
      `ScrollTrigger` once and returns the same promise to every caller.
- [x] A failed import is not cached: `loadGsap` resets its cache and rethrows, so the next caller retries. The provider
      swallows the failure: smooth scroll keeps working without ScrollTrigger.
- [x] `SmoothScrollProvider` calls `loadGsap` only after the page has loaded and the browser is idle:
      `requestIdleCallback` with a 2000 ms timeout, or a 200 ms `setTimeout` where it does not exist (Safari).
- [x] `ScrollTrigger.update()` is called on every Lenis `scroll` event once GSAP is ready. The provider subscribes with
      `useLenis` (the root instance), whose callback does nothing until `loadGsap()` has resolved and under reduced
      motion. `useLenis` re-subscribes by itself when `ReactLenis` rebuilds the instance.
- [x] Cleanup on unmount or when the preference changes: the pending idle callback or `load` listener is cancelled, the
      link to ScrollTrigger is reset, and a late-arriving import is ignored.
- [x] Reduced motion: when `(prefers-reduced-motion: reduce)` matches, `ReactLenis` stays mounted with
      `smoothWheel: false` (the wheel is left to the browser; touch is native because `syncTouch` is off) and GSAP is
      not loaded. The tree is the same in both cases, so the page is never remounted. The preference is read with
      `useSyncExternalStore`, so a change while the page is open is picked up; the server snapshot is `false`. Lenis's
      own `respectReducedMotion` (default on) only makes programmatic scrolls instant.
- [x] The burger menu stops Lenis while open (`lenis.stop()`, `start()` on close) and sets `overflow: hidden` on
      `<html>`; its panel has `data-lenis-prevent` so it can scroll itself. See [header.md](header.md).

## Design

- **Schema / Query:** none.
- **UI:** one client component, `"use client"`, no markup of its own (`ReactLenis root` renders the children).
  - Hooks: `useSyncExternalStore` for reduced motion, `useEffect` for the idle load, `useLenis` for the scroll
    callback, a `useRef` holding the ScrollTrigger update function.
  - `BurgerMenu` reads the same instance with `useLenis()`.
- **Load order:** first render with Lenis, then `load`, then idle, then `loadGsap()`, then the ref is set and the
  `useLenis` callback starts calling `ScrollTrigger.update()`.
- **Not done on purpose (D10):** Lenis is not driven from `gsap.ticker`; the clocks would differ and `lenis.raf` would
  get a negative delta.
- **Edge cases:**
  - No `requestIdleCallback`: timeout fallback.
  - Import failure: no ScrollTrigger link, scroll still smooth.
  - Preference toggled live: `ReactLenis` rebuilds its instance because the options changed (children are not
    remounted) and the effect cleans up: the ref is reset, so `ScrollTrigger` stops being updated; it is set again only
    when reduced motion goes off, and the whole sequence starts again.
  - Preference toggled while the burger menu is open: the new Lenis instance starts un-stopped, so the Lenis lock is
    lost; the `overflow: hidden` on `<html>` still holds. Rare, accepted.
  - Reduced motion already on at load: the server snapshot is `false`, so the first client render has
    `smoothWheel: true` and Lenis is created once with it, then rebuilt with `smoothWheel: false` after the real
    snapshot is read. The page itself is not remounted.

## Files

- `app/src/components/SmoothScrollProvider/SmoothScrollProvider.tsx`: provider, reduced-motion store, idle scheduling,
  ScrollTrigger link.
- `app/src/components/SmoothScrollProvider/index.ts`: re-export.
- `app/src/lib/motion/loadGsap.ts`: shared dynamic import of `gsap` and `gsap/ScrollTrigger`, plugin registration.
- `app/src/lib/constants.ts`: `REDUCED_MOTION_QUERY`.
- `app/src/app/[locale]/layout.tsx`: mounts the provider inside `NextIntlClientProvider`.
- `app/src/components/layout/BurgerMenu/BurgerMenu.tsx`: `useLenis`, `stop`/`start`, `data-lenis-prevent`.

## Acceptance criteria

- [x] Smooth scroll works in `en` and `uk`, light and dark, mobile and desktop.
- [ ] With `prefers-reduced-motion: reduce` the page scrolls natively and the network shows no GSAP chunk.
- [x] With reduced motion on at load the page is not remounted (one stable tree).
- [x] Without reduced motion the burger menu panel scrolls natively (`data-lenis-prevent`) while the page behind stays
      locked; this is intended (a second Lenis instance for the panel would break the one-instance rule).
- [ ] The GSAP chunk loads after `load` and idle, not in the first bundle.
- [ ] `pnpm format`, `pnpm code-quality` and `pnpm build` pass in `app/`.

## Tasks

Done in the code.

## Open questions

- Not checked in the browser: no GSAP chunk under reduced motion, and the GSAP chunk loading after `load` and idle.
- D10 ([../decisions.md](../decisions.md)) accepts the `scrub`/`pin` trail of one frame until real scroll animations
  exist. Proposal: re-check when the first ScrollTrigger section is built.
- Sections that animate must check reduced motion themselves, because the provider loads no GSAP under that
  preference (see the `scroll-animation` skill).
- Anchor navigation with Lenis (header links to section ids) is not specified. Proposal: check when a section with an
  anchor exists; [language-switcher.md](language-switcher.md) has an equally untested `scrollIntoView` for the hash.
