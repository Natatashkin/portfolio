'use client';

import { Link, usePathname } from '@/i18n/navigation';
import styles from './Navigation.module.scss';
import type { NavigationItem } from './Navigation.types';

type Props = {
  items: NavigationItem[];
  label: string;
};

const Navigation = ({ items, label }: Props) => {
  const pathname = usePathname();

  return (
    <nav aria-label={label}>
      <ul className={styles.list}>
        {items.map(({ _key, label: itemLabel, isAnchor, url }) =>
          itemLabel ? (
            <li key={_key}>
              {isAnchor ? (
                <a className={styles.link} href={`#${url}`}>
                  {itemLabel}
                </a>
              ) : (
                <Link
                  className={styles.link}
                  href={`/${url}`}
                  aria-current={pathname === `/${url}` ? 'page' : undefined}
                >
                  {itemLabel}
                </Link>
              )}
            </li>
          ) : null
        )}
      </ul>
    </nav>
  );
};
export default Navigation;
