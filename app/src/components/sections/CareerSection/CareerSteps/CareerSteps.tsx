'use client';

import { type CSSProperties, useEffect, useRef } from 'react';
import clsx from 'clsx';
import type { gsap } from 'gsap';
import { useIsMobile } from '@/hooks/useIsMobile';
import { NO_REDUCED_MOTION_QUERY, REDUCED_MOTION_QUERY } from '@/lib/constants';
import { loadGsap } from '@/lib/motion/loadGsap';
import type { SectionOf } from '@/lib/sanity/types';
import styles from './CareerSteps.module.scss';

type CareerStep = NonNullable<SectionOf<'careerSection'>['steps']>[number];

type CareerStepsProps = {
  steps: CareerStep[];
  // The section renders one instance per layout because they sit in different parents.
  variant: 'mobile' | 'desktop';
  isOverlay: boolean;
};

// Fractions of the viewport height from the top. Desktop: the cards of the whole list start together
// once the list is halfway up the viewport. Mobile: every card starts on its own, as it enters.
const DESKTOP_TRIGGER_LINE = 0.5;
const MOBILE_TRIGGER_LINE = 0.85;
const OFFSET_Y_PERCENT = 35;
const DURATION = 0.8;
const STAGGER = 0.3;
const EASE = 'power3.out';

// Set on the last item once it is revealed, so the pulse of its marker can start.
const REVEALED_ATTRIBUTE = 'data-revealed';

// A dashed line of the plain list that is drawn from its start as its items appear.
type DrawnLine = {
  element: Element;
  property: 'scaleX' | 'scaleY';
  duration: number;
  ease: string;
};

type RevealGroup = {
  triggerElement: Element;
  targets: Element[];
  line: DrawnLine | null;
};

const CareerSteps = ({ steps, variant, isOverlay }: CareerStepsProps) => {
  const isMobile = useIsMobile();
  const listRef = useRef<HTMLOListElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  // Before hydration both variants are in the server HTML and CSS hides one; afterwards only the
  // variant for the current viewport stays in the DOM, also after a resize.
  const isRendered = isMobile === null || isMobile === (variant === 'mobile');

  // Both instances mount while `isMobile` is `null`; only the one that stays animates, and the
  // cleanup reverts everything whenever the active variant changes.
  const isAnimated = isMobile !== null && isRendered;

  useEffect(() => {
    const list = listRef.current;
    // Checked here as well as in `mm.add`, so GSAP is not even loaded under reduced motion.
    if (
      !isAnimated ||
      !list ||
      window.matchMedia(REDUCED_MOTION_QUERY).matches
    ) {
      return;
    }

    let ignore = false;
    let mm: gsap.MatchMedia | null = null;

    loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (ignore) return;

        mm = gsap.matchMedia(list);
        mm.add(NO_REDUCED_MOTION_QUERY, () => {
          const items = Array.from(list.querySelectorAll(':scope > li'));
          if (items.length === 0) return;

          const lastItem = items[items.length - 1];
          const cardSelector = `:scope > .${styles.steps__card}`;
          const segmentSelector = `:scope > .${styles.steps__segment}`;
          const isDesktop = variant === 'desktop';
          const horizontalLine = lineRef.current;

          // Desktop: one group over the whole list; its line reaches item i's marker as item i starts
          // (item i starts at i * STAGGER). Mobile: one group per item, drawing its own segment.
          const groups: RevealGroup[] = isDesktop
            ? [
                {
                  triggerElement: list,
                  targets: items,
                  line: horizontalLine && {
                    element: horizontalLine,
                    property: 'scaleX',
                    duration: STAGGER * (items.length - 1),
                    ease: 'none'
                  }
                }
              ]
            : items.map((item) => {
                const segment = item.querySelector(segmentSelector);

                return {
                  triggerElement: item,
                  targets: [item],
                  line: segment && {
                    element: segment,
                    property: 'scaleY',
                    duration: DURATION,
                    ease: EASE
                  }
                };
              });

          const cleanups = groups.map(({ triggerElement, targets, line }) => {
            const cards = targets.flatMap((item) => {
              const card = item.querySelector(cardSelector);
              return card ? [card] : [];
            });
            const hasLast = targets.includes(lastItem);
            let isEntered = false;
            let isHidden = false;
            let tween: gsap.core.Tween | null = null;
            let lineTween: gsap.core.Tween | null = null;

            const trigger = ScrollTrigger.create({
              trigger: triggerElement,
              // The line, but never beyond the end of the page: a short list near the bottom could
              // not be scrolled up to it. The element is untransformed, so its rect is its layout.
              start: () =>
                Math.min(
                  triggerElement.getBoundingClientRect().top +
                    window.scrollY -
                    window.innerHeight *
                      (isDesktop ? DESKTOP_TRIGGER_LINE : MOBILE_TRIGGER_LINE),
                  ScrollTrigger.maxScroll(window) - 1
                ),
              once: true,
              onEnter: () => {
                isEntered = true;

                // Already past the line when created: nothing was hidden, the item is shown as is.
                if (!isHidden) {
                  if (hasLast) lastItem?.setAttribute(REVEALED_ATTRIBUTE, '');
                  return;
                }

                tween = gsap.to(cards, {
                  opacity: 1,
                  yPercent: 0,
                  duration: DURATION,
                  ease: EASE,
                  stagger: STAGGER,
                  clearProps: 'opacity,transform',
                  onComplete: () => {
                    if (hasLast) lastItem?.setAttribute(REVEALED_ATTRIBUTE, '');
                  }
                });

                if (line) {
                  lineTween = gsap.to(line.element, {
                    [line.property]: 1,
                    duration: line.duration,
                    ease: line.ease,
                    clearProps: 'transform'
                  });
                }
              }
            });

            // Hide only what has not entered yet; an entered group would never be revealed again,
            // because `once` has already killed its trigger.
            if (!isEntered && trigger.progress === 0) {
              isHidden = true;
              gsap.set(cards, { opacity: 0, yPercent: OFFSET_Y_PERCENT });
              if (line) gsap.set(line.element, { [line.property]: 0 });
            }

            // The reveal tweens start from `onEnter`, after this callback returned, so the matchMedia
            // context does not own them: they are killed here, together with their inline styles.
            return () => {
              trigger.kill();
              tween?.kill();
              lineTween?.kill();
              gsap.set(cards, { clearProps: 'opacity,transform' });
              if (line) gsap.set(line.element, { clearProps: 'transform' });
            };
          });

          return () => {
            cleanups.forEach((cleanup) => cleanup());
            lastItem?.removeAttribute(REVEALED_ATTRIBUTE);
          };
        });
      })
      // A failed import leaves the static state: nothing was hidden.
      .catch(() => {});

    return () => {
      ignore = true;
      mm?.revert();
    };
    // The effect reads the DOM that `steps` and `isOverlay` produce (the cards, and the segments and
    // the line of the plain list), so it is rebuilt when either changes, e.g. after a refresh.
  }, [isAnimated, variant, isOverlay, steps]);

  if (!isRendered) return null;

  // Only the plain list has lines: a horizontal one beside the desktop row (in a wrapper) and one
  // segment per item but the last on mobile. The overlay gets neither.
  const plainStyle: CSSProperties & Record<'--steps-count', number> = {
    '--steps-count': steps.length
  };

  const list = (
    <ol
      ref={listRef}
      className={clsx(
        styles.steps,
        styles[`steps--${variant}`],
        isOverlay && styles['steps--overlay']
      )}
    >
      {steps.map(({ _id, period, title, description: text }, index) => (
        <li key={_id} className={styles.steps__item}>
          {!isOverlay && variant === 'mobile' && index < steps.length - 1 && (
            <span aria-hidden="true" className={styles.steps__segment} />
          )}
          <div className={styles.steps__card}>
            {period && <p className={styles.steps__period}>{period}</p>}
            {title && <h3 className={styles.steps__title}>{title}</h3>}
            {text && <p className={styles.steps__text}>{text}</p>}
            <span aria-hidden="true" className={styles.steps__marker} />
          </div>
        </li>
      ))}
    </ol>
  );

  if (isOverlay || variant === 'mobile') return list;

  // The line comes before the list in the DOM, so the cards and their markers paint over it.
  return (
    <div className={styles.steps__plain} style={plainStyle}>
      <span ref={lineRef} aria-hidden="true" className={styles.steps__line} />
      {list}
    </div>
  );
};

export default CareerSteps;
