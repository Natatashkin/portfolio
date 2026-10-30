'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import type { gsap } from 'gsap';
import { NO_REDUCED_MOTION_QUERY, REDUCED_MOTION_QUERY } from '@/lib/constants';
import { loadGsap } from '@/lib/motion/loadGsap';

type CareerTextProps = {
  // Headline, description and button; the eyebrow stays outside and is not animated.
  children: ReactNode;
  className?: string;
};

// A fraction of the viewport height from the top: the block starts once its top reaches this line.
const TRIGGER_START = 'top 80%';
const OFFSET_Y = 40;
const DURATION = 0.8;
const STAGGER = 0.15;
const EASE = 'power3.out';

// The server HTML is final and fully visible. After GSAP loads, a block still below its trigger line
// is hidden and slides up once; a block already past the line is left alone, so nothing flashes.
const CareerText = ({ children, className }: CareerTextProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = ref.current;
    // Under reduced motion the content stays static, so GSAP is not even loaded (a change of the
    // preference while the page is open takes effect on the next load).
    if (!scope || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    let ignore = false;
    let mm: gsap.MatchMedia | null = null;

    loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (ignore) return;

        mm = gsap.matchMedia(scope);
        mm.add(NO_REDUCED_MOTION_QUERY, () => {
          const targets = Array.from(scope.children);
          let isEntered = false;
          let isHidden = false;
          let tween: gsap.core.Tween | null = null;

          const trigger = ScrollTrigger.create({
            trigger: scope,
            start: TRIGGER_START,
            once: true,
            onEnter: () => {
              isEntered = true;
              // Fires during creation when the line is already behind us: nothing was hidden then.
              if (!isHidden) return;

              tween = gsap.to(targets, {
                opacity: 1,
                y: 0,
                duration: DURATION,
                ease: EASE,
                stagger: STAGGER,
                clearProps: 'opacity,transform'
              });
            }
          });

          // Hide only a block that has not entered yet; one that did would never be revealed again,
          // because `once` has already killed the trigger.
          if (!isEntered && trigger.progress === 0) {
            isHidden = true;
            gsap.set(targets, { opacity: 0, y: OFFSET_Y });
          }

          // The reveal tween starts from `onEnter`, after this callback returned, so the matchMedia
          // context does not own it: it is killed here, together with its inline styles.
          return () => {
            trigger.kill();
            tween?.kill();
            gsap.set(targets, { clearProps: 'opacity,transform' });
          };
        });
      })
      // A failed import leaves the static state: the content was never hidden.
      .catch(() => {});

    return () => {
      ignore = true;
      mm?.revert();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default CareerText;
