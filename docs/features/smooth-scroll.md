# Smooth scroll

Status: done (documented after implementation)

## Goal

The page scrolls smoothly with one Lenis instance, without costing the first load: GSAP and ScrollTrigger arrive only
when the browser is idle. Visitors who prefer reduced motion get native scrolling. Rules and rationale:
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
- [x] When GSAP is ready and the Lenis instance exists, `ScrollTrigger.update()` is called on every Lenis `scroll`
      event. The provider waits up to 60 animation frames for the instance, because `ReactLenis` creates it in its own
      effect.
- [x] Cleanup on unmount or when the preference changes: pending idle callback or `load` listener cancelled, the Lenis
      subscription removed, a late-arriving import ignored (`isCancelled`).
- [x] A failed GSAP import is swallowed: smooth scroll keeps working without ScrollTrigger.
- [x] Reduced motion: when `(prefers-reduced-motion: reduce)` matches, the provider renders `children` without
      `ReactLenis` and does not load GSAP. The preference is read with `useSyncExternalStore`
      (`subscribeToReducedMotion`), so a change while the page is open is picked up. The server snapshot is `false`.
- [x] The burger menu stops Lenis while open (`lenis.stop()`, `start()` on close) and sets `overflow: hidden` on
      `<html>`; its panel has `data-lenis-prevent` so it can scroll itself. Without Lenis (reduced motion) `useLenis()`
      returns no instance and only the `overflow` lock applies. See [header.md](header.md).
- [ ] Not verified in code: scroll feel and smoothness, behavior of anchors with Lenis, and the jump or trail risk of
      `ScrollTrigger` (no scroll animation exists yet; see Open questions).

## Design

- **Schema / Query:** none.
- **UI:** one client component, `"use client"`, no markup of its own (`ReactLenis root` renders the children).
  - Hooks: `useSyncExternalStore` for reduced motion, `useEffect` for the idle load and the ScrollTrigger link,
    `useRef<LenisRef>` for the instance.
  - `BurgerMenu` reads the same instance with `useLenis()`.
- **Load order:** first render with Lenis, then `load`, then idle, then `loadGsap()`, then wait for the instance, then
  `lenis.on('scroll', ScrollTrigger.update)`.
- **Not done on purpose (D10):** Lenis is not driven from `gsap.ticker`; the clocks would differ and `lenis.raf` would
  get a negative delta.
- **Edge cases:**
  - No `requestIdleCallback`: timeout fallback.
  - Import failure: no ScrollTrigger link, scroll still smooth.
  - Instance never appears: gives up after 60 frames, nothing subscribed.
  - Preference toggled live: Lenis stops being rendered and the effect cleans up; enabling it again starts the whole
    sequence again.
  - Reduced motion already on at load: the server snapshot is `false`, so the server render and hydration use
    `ReactLenis`; after hydration the real snapshot is `true` and the provider returns bare `children`. The tree shape
    changes on first load, not only on a live toggle (see Open questions).

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
- [ ] With reduced motion already on at load there is no remount or flash of the header, page and footer (manual
      check not recorded).
- [ ] The GSAP chunk loads after `load` and idle, not in the first bundle (manual check not recorded).
- [x] No section calls `loadGsap` yet (searched `app/src`), so no section-level reduced-motion check is missing.
- [ ] `pnpm format`, `pnpm code-quality` and `pnpm build` pass in `app/` (not run by this spec).

## Tasks

Done in the code; nothing open except the questions below.

## Open questions

Mismatches between docs and code:

- `docs/features/README.md` row said "ScrollTrigger sync" without the link; fixed together with this spec. The wording
  now matches the code (ScrollTrigger is kept in step with Lenis, not a separate component).
- `docs/specs/architecture.md` line 11 and `docs/roadmap.md` line 12 still describe the setup as "Lenis + GSAP". Not
  wrong, but they do not say GSAP is loaded after idle. Proposal: leave as is, or add "(GSAP after idle)".

Author decisions needed:

- For a visitor who already prefers reduced motion, the tree shape changes on every first load (`ReactLenis` during
  server render and hydration, bare `children` afterwards), which most likely remounts the header, page and footer
  once, and `ReactLenis` may mount and be destroyed briefly. This affects the visitors the feature is meant to
  protect. Not verified at runtime. Proposal: verify first (see Acceptance criteria); if confirmed, change the code
  and D10 together, for example one stable tree that always renders `ReactLenis` and turns smoothing off for reduced
  motion, instead of only noting it in D10. A live toggle has the same cause.
- `theming-and-motion.md` says the `scrub`/`pin` trail of one frame is accepted until real scroll animations exist.
  Proposal: re-check when the first ScrollTrigger section is built.
- Anchor navigation with Lenis (header links to section ids) is not specified. Proposal: check when a section with an
  anchor exists, as [language-switcher.md](language-switcher.md) already does.
