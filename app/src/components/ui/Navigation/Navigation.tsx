'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { safePath } from '@/lib/helpers';
import styles from './Navigation.module.scss';
import type { NavigationItem } from './types';

type Props = {
  items: NavigationItem[];
  label: string;
};

const Navigation = ({ items, label }: Props) => {
  const pathname = usePathname();

  return (
    <nav aria-label={label}>
      <ul className={styles.navigation__list}>
        {items.map(({ _key, label: itemLabel, isAnchor, url }) => {
          if (!itemLabel) return null;

          if (isAnchor) {
            return (
              <li key={_key}>
                <a className={styles.navigation__link} href={`#${url}`}>
                  {itemLabel}
                </a>
              </li>
            );
          }

          const path = safePath(url);
          if (!path) return null;

          return (
            <li key={_key}>
              <Link
                className={styles.navigation__link}
                href={path}
                aria-current={pathname === path ? 'page' : undefined}
              >
                {itemLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
export default Navigation;
