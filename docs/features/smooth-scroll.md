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
- [x] A failed import is not cached: `loadGsap` resets its cache and rethrows, so the next caller retries.
- [x] `SmoothScrollProvider` calls `loadGsap` only after the page has loaded (`load` event, or immediately when
      `readyState` is `complete`) and the browser is idle: `requestIdleCallback` with a 2000 ms timeout, or a 200 ms
      `setTimeout` where it does not exist (Safari).
- [x] `ScrollTrigger.update()` is called on every Lenis `scroll` event once GSAP is ready. The provider subscribes with
      `useLenis(handleScroll)` (the root instance), whose callback calls a ref that is set only after `loadGsap()`
      resolves; before that, and under reduced motion, the ref is `null` and the callback does nothing. `useLenis`
      re-subscribes by itself when `ReactLenis` rebuilds the instance and unsubscribes with the old one.
- [x] Cleanup on unmount or when the preference changes: pending idle callback or `load` listener cancelled, the ref
      reset to `null`, a late-arriving import ignored (`isCancelled`).
- [x] A failed GSAP import is swallowed: smooth scroll keeps working without ScrollTrigger.
- [x] Reduced motion: when `(prefers-reduced-motion: reduce)` matches, `ReactLenis` stays mounted with
      `smoothWheel: false` (the wheel is left to the browser; touch is native because `syncTouch` is off) and GSAP is
      not loaded. The tree is the same in both cases, so the page is never remounted. The preference is read with
      `useSyncExternalStore` (`subscribeToReducedMotion`), so a change while the page is open is picked up. The server
      snapshot is `false`. Lenis's own `respectReducedMotion` (default on) only makes programmatic scrolls instant.
- [x] The burger menu stops Lenis while open (`lenis.stop()`, `start()` on close) and sets `overflow: hidden` on
      `<html>`; its panel has `data-lenis-prevent` so it can scroll itself. See [header.md](header.md).
- [ ] Not verified in code: scroll feel and smoothness, behavior of anchors with Lenis, and the jump or trail risk of
      `ScrollTrigger` (no scroll animation exists yet; see Open questions).

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

History: commit `5b69fe2` removed the `ScrollTriggerSync` component and moved GSAP to the idle dynamic import.

## Acceptance criteria

- [ ] Smooth scroll works in `en` and `uk`, light and dark, mobile and desktop (manual check not recorded).
- [ ] With `prefers-reduced-motion: reduce` the page scrolls natively and the network shows no GSAP chunk (manual check
      not recorded).
- [x] Before the fix, with reduced motion on at load the temporary `mount` log of `ThemeSwitcher` (two instances in
      `Header`) printed 4 times, against 2 without it: the page was remounted. Checked by the author in a production
      build.
- [x] After the fix the author saw 2 `mount` logs in a production build; the temporary log was then removed from
      `ThemeSwitcher`.
- [x] Without reduced motion the burger menu panel scrolls natively (`data-lenis-prevent`) while the page behind stays
      locked; this is intended (a second Lenis instance for the panel would break the one-instance rule).
- [ ] The GSAP chunk loads after `load` and idle, not in the first bundle (manual check not recorded).
- [x] No section calls `loadGsap` yet (searched `app/src`), so no section-level reduced-motion check is missing.
- [ ] `pnpm format`, `pnpm code-quality` and `pnpm build` pass in `app/` (not run by this spec).

## Tasks

Done in the code; nothing open except the questions below.

## Open questions

Resolved: the reduced-motion remount (confirmed with the mount log, fixed by keeping one stable tree; D10 and
[../specs/theming-and-motion.md](../specs/theming-and-motion.md) updated). Also resolved: the `waitForLenis` polling
loop and its stale-instance race were replaced by `useLenis`.

Mismatches between docs and code:

- `docs/features/README.md` row said "ScrollTrigger sync" without the link; fixed together with this spec. The wording
  now matches the code (ScrollTrigger is kept in step with Lenis, not a separate component).
- `docs/specs/architecture.md` line 11 and `docs/roadmap.md` line 12 still describe the setup as "Lenis + GSAP". Not
  wrong, but they do not say GSAP is loaded after idle. Proposal: leave as is, or add "(GSAP after idle)".

Author decisions needed:

- D10 ([../decisions.md](../decisions.md)) accepts the `scrub`/`pin` trail of one frame until real scroll animations exist.
  Proposal: re-check when the first ScrollTrigger section is built.
- Anchor navigation with Lenis (header links to section ids) is not specified. Proposal: check when a section with an
  anchor exists, as [language-switcher.md](language-switcher.md) already does.
