---
name: scroll-animation
description: Add or change motion in this portfolio repo — scroll-triggered or entrance animation with GSAP and ScrollTrigger, anything that touches Lenis smooth scroll, SmoothScrollProvider, loadGsap, useGSAP, prefers-reduced-motion, or a "use client" animation child of a section. Use this whenever the author asks to animate a section, reveal on scroll, add parallax, pin or scrub, a hover or cursor effect, or changes how scrolling feels, even if they don't name GSAP or Lenis.
---

# Scroll animation

Motion is client-only and layered on top of content that already works without it. The invariants are in
`docs/specs/theming-and-motion.md` (Motion) and the reasons in `docs/decisions.md` D10; the current wiring is in
`docs/features/smooth-scroll.md`. Read them before writing code, this skill is the procedure and the traps.

## How the pieces fit

- `SmoothScrollProvider` (`app/src/components/SmoothScrollProvider/`) owns the only Lenis instance (`ReactLenis root`
  with `autoRaf`, so Lenis runs its own loop). Never create another Lenis; read the root one with `useLenis()`.
- `loadGsap()` (`app/src/lib/motion/loadGsap.ts`) is the only way to get `gsap` and `ScrollTrigger`. It imports them
  once, registers the plugin and returns the same promise to every caller. Never `import 'gsap'` at the top of a
  component: that puts GSAP back into the first bundle (the reason for D10).
- The provider feeds `ScrollTrigger.update` from Lenis scroll events once GSAP is loaded. Do not move Lenis onto
  `gsap.ticker` (the clocks differ, `lenis.raf` gets a negative delta and the page jumps).

## Steps

1. **Spec the motion.** What moves, on which trigger, what the static (no-JS, reduced-motion) state looks like. Put it
   in the section's feature spec (`docs-writer`, mode `draft`), not only in code.
2. **Make the static state the real one.** The content is fully visible and laid out without JS. Never hide it in
   CSS (`opacity: 0`, `visibility: hidden`) to reveal it later: with no JS or a failed GSAP import it stays hidden.
3. **Put the animation in a private client child** of the section folder (`"use client"`, named after what it does,
   not re-exported). The section itself stays a Server Component. Interface-only or purely visual wrappers are fine;
   no CMS data into `dangerouslySetInnerHTML`.
4. **Write the effect.**
   - Pattern (confirmed on the career section: `CareerText` and `CareerSteps`). Use `useEffect`, not `useGSAP`: tweens
     created after an `await` are not captured by the context `useGSAP` makes, so the cleanup is written by hand.

     ```tsx
     useEffect(() => {
       let ignore = false;
       let mm: gsap.MatchMedia | undefined;

       loadGsap().then(({ gsap }) => {
         if (ignore) return;
         mm = gsap.matchMedia(scopeRef);
         mm.add("(prefers-reduced-motion: no-preference)", () => {
           // tweens and ScrollTriggers go here
         });
       });

       return () => {
         ignore = true;
         mm?.revert();
       };
     }, []);
     ```

   - Cleanup can run before `.then` resolves, so `mm` may still be `undefined` (hence `ignore` and `mm?.revert()`).
   - Selectors are scoped by `scopeRef` (the component's ref); never query `document` directly.
   - Apply initial states (`gsap.set`, `from`) only after GSAP is ready; first-screen motion that must be instant is
     CSS, not GSAP.
   - Animate `transform` and `opacity` only (`x`, `y`, `scale`, `rotation`, `autoAlpha` is fine). Never `top`,
     `left`, `width`, `height`, `margin`.
5. **Honor reduced motion.** The provider does not load GSAP under `prefers-reduced-motion`, but a section that
   awaits `loadGsap()` itself still must check: the tweens live inside the `mm.add('(prefers-reduced-motion:
no-preference)', ...)` callback from step 4, and the content stays in its static state otherwise. This is the check
   most often forgotten. `matchMedia` reverts its own tweens when the preference flips and on `mm.revert()`, so it is
   the only owner of cleanup: do not add a second `gsap.context` for the same tweens. A section with no media
   condition can use `gsap.context(..., scopeRef)` and `ctx.revert()` in the same place instead.
6. **Refresh after layout changes.** When async content or a locale change alters page height, call
   `ScrollTrigger.refresh()`. Remember a locale switch remounts the whole `[locale]` layout (D14), so triggers are
   rebuilt by the effect cleanup and setup from step 4, not carried over.
7. **Cursor effects** (if ever added) are disabled for `(pointer: coarse)` and reduced motion.

## Traps

- A `scrub` or `pin` animation may trail Lenis by one frame; this is the accepted cost of D10. The career section
  uses neither (one-shot reveals), so the trail has not been re-checked yet: re-check it on the first `scrub` or
  `pin`. If the trail is visible, record a new decision in `docs/decisions.md`; do not quietly switch the clock.
- A tween started from a ScrollTrigger callback (`onEnter`) is created after the `matchMedia` callback returned, so
  `mm.revert()` does not own it: kill it, and clear its inline styles, in the cleanup the callback returns.
- Create the trigger first and hide the element only if it has not been reached (`progress === 0` and `onEnter` has
  not fired); GSAP fires `onEnter` at creation for a line already passed, and a hidden element would never be shown
  again once `once` has killed the trigger.
- Check `prefers-reduced-motion` before `loadGsap()` as well, or the GSAP chunk is fetched for nothing.
- A trigger line can be unreachable when the page ends first (a short block near the bottom). Use a function `start`
  capped at `ScrollTrigger.maxScroll(window) - 1`; `clamp()` on `start` left the progress at 0 and on `end` made the
  trigger count as already passed.
- Trigger on an element that is never transformed and animate a child, or the hidden state moves the trigger's own
  `start`.
- Do not remount the tree based on the reduced-motion preference: its server snapshot is `false`, so a different tree
  shape remounts header, page and footer on every load. Change options, not structure.
- Lenis locks scroll for the burger menu; do not add a second scroll lock.
- A failed GSAP import must leave the page working: catch the rejection (or let the static state stand) and never
  throw into render.

## Verify

Beyond the `work-block` checks, look at it in the browser: no motion and fully visible content with JS disabled and
with reduced motion on; no console warnings; scroll stays smooth; the animation reruns correctly after a language
switch. Say plainly which of these you could not check.
