'use client';

import type { ElementType, ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';

type Props = {
  as?: ElementType;
  className?: string;
  // Share of the element that must be on screen before it counts as in view.
  threshold?: number;
  children: ReactNode;
};

// Sets `data-in-view="true"` the first time the element scrolls into view, so CSS can start an
// animation then. Content is rendered as usual, so crawlers and no-JS visitors see it unchanged.
const InView = ({
  as: Tag = 'div',
  className,
  threshold = 0.5,
  children
}: Props) => {
  const { ref, isInView } = useInView<HTMLElement>(threshold);

  return (
    <Tag ref={ref} className={className} data-in-view={isInView}>
      {children}
    </Tag>
  );
};

export default InView;
