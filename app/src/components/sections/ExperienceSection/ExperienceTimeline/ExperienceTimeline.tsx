'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import type { gsap } from 'gsap';
import { useTranslations } from 'next-intl';
import { NO_REDUCED_MOTION_QUERY, REDUCED_MOTION_QUERY } from '@/lib/constants';
import { loadGsap } from '@/lib/motion/loadGsap';
import styles from './ExperienceTimeline.module.scss';

type Props = {
  // The company cards, already rendered on the server, each one a `li`.
  children: ReactNode;
};

// A card is revealed once a third of it is on screen (the offset is capped at a third of the viewport,
// so a card taller than the screen still reveals).
const VISIBLE_FRACTION = 1 / 3;
const OFFSET_Y = 48;
const DURATION = 0.8;
const EASE = 'power3.out';

// The card, its marker and its date: what the reveal moves. The `li` around it is never transformed,
// so the hidden state cannot move its own trigger.
const REVEAL_SELECTOR = ':scope > [data-reveal]';

// The right column: the ordered list of company cards. It scrolls with the page; the intro on the left
// is the part that stays (see `ExperienceIntro`).
//
// The server HTML is final and fully visible. After GSAP loads, a card that is wholly below the screen
// is hidden and rises once; a card that is already on screen is left alone, so nothing flashes.
const ExperienceTimeline = ({ children }: Props) => {
  const t = useTranslations('ExperienceSection');
  const listRef = useRef<HTMLOListElement>(null);
  // Cards that have been revealed stay revealed when the effect runs again (a media query flips).
  const [revealed] = useState(() => new WeakSet<Element>());

  useEffect(() => {
    const list = listRef.current;
    // Checked here as well as in `mm.add`, so GSAP is not even loaded under reduced motion.
    if (!list || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    let ignore = false;
    let mm: gsap.MatchMedia | null = null;

    loadGsap().then(
      ({ gsap, ScrollTrigger }) => {
        if (ignore) return;

        mm = gsap.matchMedia(list);
        // A switch to reduced motion while the page is open reverts the reveal. Switching it off again
        // takes effect on the next load: with the preference on, the effect did not load GSAP at all.
        mm.add(NO_REDUCED_MOTION_QUERY, () => {
          const pending = new Set<Element>();
          const cleanups: Array<() => void> = [];

          list.querySelectorAll(':scope > li').forEach((item) => {
            const card = item.querySelector(REVEAL_SELECTOR);

            if (!card || revealed.has(item)) return;

            let tween: gsap.core.Tween | null = null;
            let isEntered = false;
            let isHidden = false;

            const trigger = ScrollTrigger.create({
              trigger: item,
              // The line where a third of the card (at most a third of the viewport) is above the bottom
              // edge, but never beyond the end of the page: a card near the bottom could not be scrolled
              // up to it. The `li` is untransformed, so its rect is its layout.
              start: () => {
                const { top, height } = item.getBoundingClientRect();
                const visible =
                  Math.min(height, window.innerHeight) * VISIBLE_FRACTION;

                return Math.min(
                  top + window.scrollY - window.innerHeight + visible,
                  ScrollTrigger.maxScroll(window) - 1
                );
              },
              end: 'max',
              once: true,
              onEnter: () => {
                isEntered = true;
                revealed.add(item);
                pending.delete(item);

                // Already past the line when created: nothing was hidden, the card is shown as is.
                if (!isHidden) return;

                tween = gsap.to(card, {
                  opacity: 1,
                  y: 0,
                  duration: DURATION,
                  ease: EASE,
                  clearProps: 'opacity,transform'
                });
              }
            });

            // Hide only a card that is wholly below the screen and has not entered yet: an entered
            // card would never be revealed again (`once` has killed its trigger), and one already
            // partly on screen would pop out and back after the first paint, so it stays as drawn.
            if (
              !isEntered &&
              trigger.progress === 0 &&
              item.getBoundingClientRect().top >= window.innerHeight
            ) {
              isHidden = true;
              pending.add(item);
              gsap.set(card, { opacity: 0, y: OFFSET_Y });
            }

            // The reveal tween starts from `onEnter`, after this callback returned, so the matchMedia
            // context does not own it: it is killed here, together with its inline styles.
            cleanups.push(() => {
              trigger.kill();
              tween?.kill();
              gsap.set(card, { clearProps: 'opacity,transform' });
            });
          });

          // Opening a row changes the height of everything below it. While cards still wait for their
          // line, their start positions must follow; with none waiting nothing depends on the height.
          const handleListClick = (event: Event) => {
            if (
              pending.size === 0 ||
              !(event.target instanceof Element) ||
              // The entry toggle is the only button here with `aria-expanded`.
              !event.target.closest('button[aria-expanded]')
            ) {
              return;
            }

            // After React has applied the toggle.
            requestAnimationFrame(() => {
              if (pending.size > 0) ScrollTrigger.refresh();
            });
          };

          list.addEventListener('click', handleListClick);

          return () => {
            list.removeEventListener('click', handleListClick);
            cleanups.forEach((cleanup) => cleanup());
          };
        });
      },
      // Only a failed import is ignored (nothing was hidden); an error in the setup stays visible.
      () => {}
    );

    return () => {
      ignore = true;
      mm?.revert();
    };
  }, [revealed]);

  return (
    <ol ref={listRef} className={styles.timeline} aria-label={t('timeline')}>
      {children}
    </ol>
  );
};

export default ExperienceTimeline;
