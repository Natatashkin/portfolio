'use client';

import { useEffect, useRef } from 'react';
import { POINTER_QUERY } from '@/lib/constants';
import styles from './HeroGrid.module.scss';

const SMOOTHING = 0.12;
const SETTLE_DISTANCE = 0.5;
const START_X = 0.5;
const START_Y = 0.4;

type Props = {
  className?: string;
};

// Dot grid lit around the cursor. Pointer-only: touch and reduced-motion keep the static spot.
const HeroGrid = ({ className }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const startTracking = (): (() => void) => {
      const { width, height } = element.getBoundingClientRect();
      let currentX = width * START_X;
      let currentY = height * START_Y;
      let targetX = currentX;
      let targetY = currentY;
      let frame = 0;
      let isVisible = true;

      const paint = () => {
        currentX += (targetX - currentX) * SMOOTHING;
        currentY += (targetY - currentY) * SMOOTHING;
        element.style.setProperty('--spot-x', `${currentX}px`);
        element.style.setProperty('--spot-y', `${currentY}px`);

        const isSettled =
          Math.abs(targetX - currentX) < SETTLE_DISTANCE &&
          Math.abs(targetY - currentY) < SETTLE_DISTANCE;
        frame = isSettled ? 0 : requestAnimationFrame(paint);
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (!isVisible) return;

        const bounds = element.getBoundingClientRect();
        targetX = event.clientX - bounds.left;
        targetY = event.clientY - bounds.top;
        if (!frame) frame = requestAnimationFrame(paint);
      };

      const handleIntersection: IntersectionObserverCallback = ([entry]) => {
        isVisible = entry.isIntersecting;
      };

      const observer = new IntersectionObserver(handleIntersection);
      observer.observe(element);
      window.addEventListener('pointermove', handlePointerMove);

      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        observer.disconnect();
        cancelAnimationFrame(frame);
      };
    };

    const query = window.matchMedia(POINTER_QUERY);
    let stopTracking = query.matches ? startTracking() : null;

    const handleQueryChange = (event: MediaQueryListEvent) => {
      stopTracking?.();
      stopTracking = event.matches ? startTracking() : null;
    };
    query.addEventListener('change', handleQueryChange);

    return () => {
      query.removeEventListener('change', handleQueryChange);
      stopTracking?.();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={[styles.heroGrid, className].filter(Boolean).join(' ')}
    />
  );
};

export default HeroGrid;
