'use client';

import { useOptimistic, useTransition } from 'react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import styles from './Filter.module.scss';
import type { FilterItem } from './types';

type Props = {
  items: FilterItem[];
  // The selected values, already normalized by the page; the URL is the source of truth.
  value: string[];
  label: string;
  paramName?: string;
};

// A multi-select chip row that writes its state to the URL as repeated params (`?filter=a&filter=b`).
// The chips switch at once (optimistic) and the root carries `data-pending` until the new list arrives,
// so a sibling results container can dim through CSS `:has()`.
const Filter = ({ items, value, label, paramName = 'filter' }: Props) => {
  const t = useTranslations('Filter');
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startNavigation] = useTransition();
  const [selected, setSelected] = useOptimistic(value);

  const navigate = (next: string[]) => {
    startNavigation(() => {
      setSelected(next);
      router.replace(
        next.length > 0 ? { pathname, query: { [paramName]: next } } : pathname,
        { scroll: false }
      );
    });
  };

  // Toggles one chip; the list keeps the order of `items`, so the URL does not depend on click order. A value that
  // is not among the chips is dropped (the page has already normalized `value`, so this is only a safeguard).
  const handleSelect = (chip: string) => {
    const next = selected.includes(chip)
      ? selected.filter((current) => current !== chip)
      : items
          .map(({ value: itemValue }) => itemValue)
          .filter(
            (itemValue) => itemValue === chip || selected.includes(itemValue)
          );
    navigate(next);
  };

  const handleReset = () => {
    if (selected.length > 0) navigate([]);
  };

  return (
    <div
      role="group"
      aria-label={label}
      className={styles.filter}
      data-pending={isPending || undefined}
    >
      <button
        type="button"
        className={clsx(
          styles.filter__chip,
          selected.length === 0 && styles['filter__chip--active']
        )}
        aria-pressed={selected.length === 0}
        onClick={handleReset}
      >
        {t('all')}
      </button>
      {items.map((item) => {
        const isActive = selected.includes(item.value);

        return (
          <button
            key={item.value}
            type="button"
            className={clsx(
              styles.filter__chip,
              isActive && styles['filter__chip--active']
            )}
            aria-pressed={isActive}
            onClick={() => handleSelect(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default Filter;
