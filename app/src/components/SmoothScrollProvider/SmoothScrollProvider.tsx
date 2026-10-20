'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { REDUCED_MOTION_QUERY } from '@/lib/constants';
import { loadGsap } from '@/lib/motion/loadGsap';

import 'lenis/dist/lenis.css';

const IDLE_TIMEOUT_MS = 2000;
const IDLE_FALLBACK_DELAY_MS = 200;

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
// ScrollTrigger follows Lenis's scroll. With reduced motion Lenis stays mounted
// but does not smooth the wheel, and GSAP is not loaded.
const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  // Set once GSAP is loaded; until then (and under reduced motion) it is null.
  const updateScrollTriggerRef = useRef<(() => void) | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getSnapshot,
    getServerSnapshot
  );

  // useLenis follows the root instance, so the subscription survives a rebuild
  // of Lenis and is removed with it.
  const handleScroll = useCallback(
    () => updateScrollTriggerRef.current?.(),
    []
  );
  useLenis(handleScroll);

  useEffect(() => {
    if (reducedMotion) return;

    let isCancelled = false;

    const connectScrollTrigger = async () => {
      try {
        const { ScrollTrigger } = await loadGsap();
        if (isCancelled) return;

        updateScrollTriggerRef.current = () => ScrollTrigger.update();
      } catch {
        // Smooth scroll works without ScrollTrigger, so a failed GSAP import is
        // not fatal.
      }
    };

    const cancelIdle = runWhenIdle(() => void connectScrollTrigger());

    return () => {
      isCancelled = true;
      cancelIdle();
      updateScrollTriggerRef.current = null;
    };
  }, [reducedMotion]);

  // Same tree with and without reduced motion, so a preference change never remounts the page.
  return (
    <ReactLenis root options={{ autoRaf: true, smoothWheel: !reducedMotion }}>
      {children}
    </ReactLenis>
  );
};

export default SmoothScrollProvider;
