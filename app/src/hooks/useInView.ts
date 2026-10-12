'use client';

import { useEffect, useRef, useState } from 'react';

// True from the first moment `threshold` of the element is on screen; it never turns back to false.
export const useInView = <T extends Element>(threshold = 0.5) => {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleIntersection: IntersectionObserverCallback = (
      [entry],
      observer
    ) => {
      if (!entry.isIntersecting) return;
      setIsInView(true);
      observer.disconnect();
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
};
