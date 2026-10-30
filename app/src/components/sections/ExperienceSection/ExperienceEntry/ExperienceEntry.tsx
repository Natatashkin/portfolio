'use client';

import { type ReactNode, useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronIcon, DotIcon } from '@/components/icons';
import styles from './ExperienceEntry.module.scss';

type Props = {
  title: string;
  // Number of description items, shown on the collapsed row; 0 shows none.
  count: number;
  // The server-rendered body: the entry's technologies and its description. Without it there is nothing to toggle.
  children?: ReactNode;
};

// One layout for both viewports. The body is a plain element in every state; below `lg` the SCSS
// collapses it from `data-open`, from `lg` no rule does, and the toggle is not displayed. So the
// server and the client render the same thing and desktop never flashes a collapsed state.
const ExperienceEntry = ({ title, count, children }: Props) => {
  const t = useTranslations('ExperienceSection');
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const titleId = `${id}-title`;
  const countId = `${id}-count`;
  const bodyId = `${id}-body`;

  const handleToggle = () => setIsOpen((open) => !open);

  return (
    <div className={styles.entry} data-open={isOpen}>
      <div className={styles.entry__header}>
        {children && (
          <span className={styles.entry__dot} aria-hidden="true">
            <DotIcon />
          </span>
        )}
        <h4 id={titleId} className={styles.entry__title}>
          {title}
        </h4>
        {children && (
          // The name is the visible title and count, so it contains the visible text (WCAG 2.5.3).
          <button
            type="button"
            className={styles.entry__toggle}
            aria-expanded={isOpen}
            aria-controls={bodyId}
            aria-labelledby={count > 0 ? `${titleId} ${countId}` : titleId}
            onClick={handleToggle}
          >
            {count > 0 && (
              <span id={countId} className={styles.entry__count}>
                <span aria-hidden="true">{count}</span>
                <span className={styles.entry__countLabel}>
                  {t('items', { count })}
                </span>
              </span>
            )}
            <span className={styles.entry__arrow} aria-hidden="true">
              <ChevronIcon />
            </span>
          </button>
        )}
      </div>
      {children && (
        <div id={bodyId} className={styles.entry__body}>
          {children}
        </div>
      )}
    </div>
  );
};

export default ExperienceEntry;
