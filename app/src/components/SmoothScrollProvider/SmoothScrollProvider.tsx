'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { type LenisRef, ReactLenis } from 'lenis/react';
import { REDUCED_MOTION_QUERY } from '@/lib/constants';
import { loadGsap } from '@/lib/motion/loadGsap';

import 'lenis/dist/lenis.css';

const IDLE_TIMEOUT_MS = 2000;
const IDLE_FALLBACK_DELAY_MS = 200;
const LENIS_WAIT_FRAMES = 60;

const subscribeToReducedMotion = (handleChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', handleChange);
  return () => query.removeEventListener('change', handleChange);
};

const getSnapshot = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerSnapshot = () => false;

// Runs the callback once the page has loaded and the browser is idle; returns a
// cancel function.
const runWhenIdle = (callback: () => void): (() => void) => {
  let cancelIdle = () => {};

  const schedule = () => {
    // Safari has no requestIdleCallback, although the DOM types declare it.
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(callback, {
        timeout: IDLE_TIMEOUT_MS
      });
      cancelIdle = () => window.cancelIdleCallback(id);
    } else {
      const id = window.setTimeout(callback, IDLE_FALLBACK_DELAY_MS);
      cancelIdle = () => window.clearTimeout(id);
    }
  };

  if (document.readyState === 'complete') {
    schedule();
    return () => cancelIdle();
  }

  window.addEventListener('load', schedule, { once: true });
  return () => {
    window.removeEventListener('load', schedule);
    cancelIdle();
  };
};

type SmoothScrollProviderProps = {
  children: ReactNode;
};

// One Lenis instance for the whole app, on its own animation loop and in the
// first bundle. GSAP is loaded when the browser is idle; once it is there,
// ScrollTrigger follows Lenis's scroll. Skipped with reduced motion.
const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  const lenisRef = useRef<LenisRef>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    if (reducedMotion) return;

    let isCancelled = false;
    let unsubscribe = () => {};

    // ReactLenis creates the instance in its own effect, so wait a few frames
    // for it if it is not there yet.
    const waitForLenis = async () => {
      for (let frame = 0; frame < LENIS_WAIT_FRAMES; frame += 1) {
        const lenis = lenisRef.current?.lenis;
        if (lenis || isCancelled) return lenis;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
    };

    const connectScrollTrigger = async () => {
      try {
        const { ScrollTrigger } = await loadGsap();
        const lenis = await waitForLenis();
        if (isCancelled || !lenis) return;

        unsubscribe = lenis.on('scroll', () => ScrollTrigger.update());
      } catch {
        // Smooth scroll works without ScrollTrigger, so a failed GSAP import is
        // not fatal.
      }
    };

    const cancelIdle = runWhenIdle(() => void connectScrollTrigger());

    return () => {
      isCancelled = true;
      cancelIdle();
      unsubscribe();
    };
  }, [reducedMotion]);

  if (reducedMotion) return children;

  return (
    <ReactLenis root options={{ autoRaf: true }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
};

export default SmoothScrollProvider;
