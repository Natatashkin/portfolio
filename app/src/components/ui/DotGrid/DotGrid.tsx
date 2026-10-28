'use client';

import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import {
  DOT_GRID_SETTLE_DISTANCE,
  DOT_GRID_SMOOTHING,
  DOT_GRID_START_X,
  DOT_GRID_START_Y,
  POINTER_QUERY
} from '@/lib/constants';
import styles from './DotGrid.module.scss';

type Props = {
  className?: string;
};

// Dot grid lit around the cursor. Pointer-only: touch and reduced-motion keep the static spot.
const DotGrid = ({ className }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const startTracking = (): (() => void) => {
      const { width, height } = element.getBoundingClientRect();
      let currentX = width * DOT_GRID_START_X;
      let currentY = height * DOT_GRID_START_Y;
      let targetX = currentX;
      let targetY = currentY;
      let frame = 0;
      let isVisible = true;

      const paint = () => {
        currentX += (targetX - currentX) * DOT_GRID_SMOOTHING;
        currentY += (targetY - currentY) * DOT_GRID_SMOOTHING;
        element.style.setProperty('--spot-x', `${currentX}px`);
        element.style.setProperty('--spot-y', `${currentY}px`);

        const isSettled =
          Math.abs(targetX - currentX) < DOT_GRID_SETTLE_DISTANCE &&
          Math.abs(targetY - currentY) < DOT_GRID_SETTLE_DISTANCE;
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
      className={clsx(styles.dotGrid, className)}
    />
  );
};

export default DotGrid;
