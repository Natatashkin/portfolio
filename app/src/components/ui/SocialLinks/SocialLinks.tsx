import { useTranslations } from 'next-intl';
import { safeHref } from '@/lib/helpers/safeHref';
import styles from './SocialLinks.module.scss';
import type { SocialLink } from './types';

type Props = {
  items: SocialLink[];
};

const SocialLinks = ({ items }: Props) => {
  const t = useTranslations('SocialLinks');

  return (
    <ul className={styles.socialLinks} aria-label={t('label')}>
      {items.map(({ _key, label, url }) => {
        const href = safeHref(url);
        if (!label || !href) return null;

        return (
          <li key={_key}>
            <a
              className={styles.socialLinks__link}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {label}
              <span className={styles.socialLinks__hidden}>
                {' '}
                ({t('opensInNewTab')})
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SocialLinks;
