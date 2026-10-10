import styles from './Navigation.module.scss';
import type { NavigationItem } from './Navigation.types';

type Props = {
  items: NavigationItem[];
  label: string;
};

const Navigation = ({ items, label }: Props) => (
  <nav aria-label={label}>
    <ul className={styles.list}>
      {items.map(({ _key, label: itemLabel, anchor }) =>
        itemLabel ? (
          <li key={_key}>
            <a className={styles.link} href={`#${anchor}`}>
              {itemLabel}
            </a>
          </li>
        ) : null
      )}
    </ul>
  </nav>
);

export default Navigation;
