import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import styles from './Breadcrumbs.module.scss';
import type { BreadcrumbItem } from './types';

type Props = {
  items: BreadcrumbItem[];
};

// Every trail starts at `Home`, so callers pass only the rest of the path. `Home` alone is not a trail
// (the home page has none), so without other items nothing renders.
const Breadcrumbs = ({ items }: Props) => {
  const t = useTranslations('Breadcrumbs');
  const steps = items.filter(({ label }) => label);

  if (steps.length === 0) return null;

  const trail: BreadcrumbItem[] = [{ label: t('home'), href: '/' }, ...steps];
  const lastIndex = trail.length - 1;

  return (
    <nav aria-label={t('label')} className={styles.breadcrumbs}>
      <ol className={styles.breadcrumbs__list}>
        {trail.map(({ label, href }, index) => (
          <li key={href ?? label} className={styles.breadcrumbs__item}>
            {index === lastIndex ? (
              <span className={styles.breadcrumbs__current} aria-current="page">
                {label}
              </span>
            ) : href ? (
              <Link className={styles.breadcrumbs__link} href={href}>
                {label}
              </Link>
            ) : (
              <span className={styles.breadcrumbs__text}>{label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
