'use client';

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';

// Lenis moves the scroll position itself, so ScrollTrigger has to be told on every
// scroll tick. A child is needed because the Lenis instance only exists inside ReactLenis.
const ScrollTriggerSync = () => {
  useLenis(() => ScrollTrigger.update());

  return null;
};

export default ScrollTriggerSync;
