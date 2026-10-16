// GSAP and ScrollTrigger stay out of the first bundle: they are imported on
// first use and shared after that. Every caller awaits the same promise, so the
// plugin is registered once.
const importGsap = async () => {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger')
  ]);
  gsap.registerPlugin(ScrollTrigger);

  return { gsap, ScrollTrigger };
};

let gsapReady: ReturnType<typeof importGsap> | null = null;

export const loadGsap = (): ReturnType<typeof importGsap> => {
  gsapReady ??= importGsap().catch((error: unknown) => {
    // A failed import (network) must not stay cached: the next caller tries
    // again.
    gsapReady = null;
    throw error;
  });

  return gsapReady;
};
