'use client';

import clsx from 'clsx';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { SectionOf } from '@/lib/sanity/types';
import styles from './CareerSteps.module.scss';

type CareerStep = NonNullable<SectionOf<'careerSection'>['steps']>[number];

type CareerStepsProps = {
  steps: CareerStep[];
  // The section renders one instance per layout because they sit in different parents.
  variant: 'mobile' | 'desktop';
  isOverlay: boolean;
};

const CareerSteps = ({ steps, variant, isOverlay }: CareerStepsProps) => {
  const isMobile = useIsMobile();

  // Before hydration both variants are in the server HTML and CSS hides one; afterwards only the
  // variant for the current viewport stays in the DOM, also after a resize.
  if (isMobile !== null && isMobile !== (variant === 'mobile')) return null;

  return (
    <ol
      className={clsx(
        styles.steps,
        styles[`steps--${variant}`],
        isOverlay && styles['steps--overlay']
      )}
    >
      {steps.map(({ _id, period, title, description: text }) => (
        <li key={_id} className={styles.steps__item}>
          {period && <p className={styles.steps__period}>{period}</p>}
          {title && <h3 className={styles.steps__title}>{title}</h3>}
          {text && <p className={styles.steps__text}>{text}</p>}
          <span aria-hidden="true" className={styles.steps__marker} />
        </li>
      ))}
    </ol>
  );
};

export default CareerSteps;
