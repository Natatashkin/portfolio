import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import Filter, { type FilterItem } from '@/components/ui/Filter';
import ProjectCardSkeleton from '@/components/ui/ProjectCard/ProjectCardSkeleton';
import styles from './ProjectsResults.module.scss';

type Props = {
  items: FilterItem[];
  value: string[];
  count: ReactNode;
  list: ReactNode;
};

// The layout of the results: the filter, the counter and the list. The same frame renders the loading state, so
// nothing moves when the real results arrive.
const ResultsFrame = ({ items, value, count, list }: Props) => {
  const t = useTranslations('ProjectsResults');

  return (
    <div className={styles.results}>
      <Filter items={items} value={value} label={t('filterLabel')} />
      {/* Persistent: only its text changes, so a screen reader announces the new count. */}
      <p className={styles.results__count} role="status">
        {count}
      </p>
      <div className={styles.results__list}>
        {/* An invisible card row under the list: the area is never shorter than one card, so the footer does not jump
            between the skeletons, the cards and the empty state. */}
        <ul className={styles.results__reserve} aria-hidden="true">
          <ProjectCardSkeleton />
        </ul>
        <div className={styles.results__content}>{list}</div>
      </div>
    </div>
  );
};

export const SkeletonGrid = () => (
  <ul className={styles.results__grid}>
    <ProjectCardSkeleton />
    <ProjectCardSkeleton />
    <ProjectCardSkeleton />
  </ul>
);

export default ResultsFrame;
