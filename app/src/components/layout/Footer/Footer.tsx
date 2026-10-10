import { useTranslations } from 'next-intl';
import styles from './Footer.module.scss';
import type { SocialLink } from './Footer.types';

type Props = {
  copyright: string | null;
  socialLinks: SocialLink[];
};

const Footer = ({ copyright, socialLinks }: Props) => {
  const t = useTranslations('Footer');

  return (
    <footer className={styles.footer}>
      {copyright && <p className={styles.copyright}>{copyright}</p>}
      <ul className={styles.links} aria-label={t('socialLinks')}>
        {socialLinks.map(({ _key, label, url }) => (
          <li key={_key}>
            <a
              className={styles.link}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {label}
              <span className={styles.hidden}> ({t('opensInNewTab')})</span>
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
};

export default Footer;
