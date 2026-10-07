'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { type LenisRef, ReactLenis } from 'lenis/react';

import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(handleChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', handleChange);
  return () => query.removeEventListener('change', handleChange);
}

const getSnapshot = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerSnapshot = () => false;

type SmoothScrollProviderProps = {
  children: ReactNode;
};

// One Lenis instance for the whole app, driven by the GSAP ticker so Lenis and
// ScrollTrigger share a single animation loop. Skipped with reduced motion.
export default function SmoothScrollProvider({
  children
}: SmoothScrollProviderProps) {
  const lenisRef = useRef<LenisRef>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    if (reducedMotion) return;

    // gsap.ticker time is in seconds, Lenis expects milliseconds
    const raf = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [reducedMotion]);

  if (reducedMotion) return children;

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
