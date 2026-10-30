'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import type { gsap } from 'gsap';
import {
  INTRO_PIN_QUERY,
  REDUCED_MOTION_QUERY,
  RESIZE_REFRESH_DELAY_MS
} from '@/lib/constants';
import { loadGsap } from '@/lib/motion/loadGsap';

type Props = {
  className?: string;
  // The server-rendered intro: eyebrow, headline, description and the CV buttons.
  children: ReactNode;
};

// How far below the top of the screen the pinned column stays, in px.
const PIN_OFFSET = 96;

// The left column. From `lg` it stays in place while the cards on the right scroll past, and goes on
// with them when the last card ends. It is not animated: the pin only holds it. Below `lg`, on a short
// screen, under reduced motion, without JS or after a failed GSAP import it is an ordinary block.
//
// While pinned, the column's grid item is GSAP's spacer, which copies the box of this element: keep
// `grid-area` and margins off its class, or the spacer and the column would disagree.
const ExperienceIntro = ({ className, children }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const intro = ref.current;
    // The grid row: the pin is held for as long as it lasts.
    const layout = intro?.parentElement;

    // Checked here as well as in `mm.add`, so GSAP is not even loaded under reduced motion.
    if (!intro || !layout || window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      return;
    }

    let ignore = false;
    let mm: gsap.MatchMedia | null = null;

    loadGsap().then(
      ({ gsap, ScrollTrigger }) => {
        if (ignore) return;

        mm = gsap.matchMedia(layout);
        mm.add(INTRO_PIN_QUERY, () => {
          let pin: ReturnType<typeof ScrollTrigger.create> | null = null;
          let timer: number | undefined;

          // A column that does not fit the screen (its last button would be cut off and out of reach),
          // or that is not shorter than the cards, has nothing to hold.
          const canHold = () =>
            intro.offsetHeight + PIN_OFFSET <= window.innerHeight &&
            layout.offsetHeight > intro.offsetHeight;

          // Measured without the pin: it is taken off first, so a resized window (a shorter screen, a
          // narrower column that wraps the text) is judged by the column's natural height.
          const sync = () => {
            pin?.kill(true);
            pin = null;

            if (!canHold()) return;

            pin = ScrollTrigger.create({
              trigger: layout,
              pin: intro,
              // The row is as tall as the cards: the column leaves no space of its own behind.
              pinSpacing: false,
              start: `top ${PIN_OFFSET}px`,
              // The row's bottom reaches the bottom of the pinned column.
              end: () => `bottom ${PIN_OFFSET + intro.offsetHeight}px`,
              anticipatePin: 1
            });
          };

          const handleResize = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(sync, RESIZE_REFRESH_DELAY_MS);
          };

          sync();
          window.addEventListener('resize', handleResize);

          return () => {
            window.removeEventListener('resize', handleResize);
            window.clearTimeout(timer);
            pin?.kill(true);
          };
        });
      },
      // Only a failed import is ignored: the column stays where the page puts it.
      () => {}
    );

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

export default ExperienceIntro;
