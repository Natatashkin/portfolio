'use client';

import type { CSSProperties } from 'react';
import { useInView } from '@/hooks/useInView';
import { useIsMounted } from '@/hooks/useIsMounted';
import styles from './HeroMetricNumber.module.scss';

type Props = {
  value: string;
  // Position in the list; staggers the reveal when several numbers appear at once.
  index: number;
  className?: string;
};

// A metric value that fades in once it scrolls into view. The server HTML renders it fully
// visible (crawlers and screenshots see the content); after hydration the script hides it and
// reveals it again with the animation.
const HeroMetricNumber = ({ value, index, className }: Props) => {
  const { ref, isInView } = useInView<HTMLParagraphElement>();
  const isArmed = useIsMounted();

  return (
    <p
      ref={ref}
      className={[
        styles.metricNumber,
        isArmed && styles['metricNumber--armed'],
        isInView && styles['metricNumber--revealed'],
        className
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--index': index } as CSSProperties}
    >
      {value}
    </p>
  );
};

export default HeroMetricNumber;
