import { useTranslations } from 'next-intl';
import Navigation, { type NavigationItem } from '@/components/ui/Navigation';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import { Link } from '@/i18n/navigation';
import styles from './Header.module.scss';

type Props = {
  navigation: NavigationItem[];
  siteName: string | null;
};

const Header = ({ navigation, siteName }: Props) => {
  const t = useTranslations('Header');

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        {t('skipToContent')}
      </a>
      <header className={styles.header}>
        {siteName && (
          <Link className={styles.siteName} href="/">
            {siteName}
          </Link>
        )}
        <Navigation items={navigation} label={t('navigation')} />
        <ThemeSwitcher />
      </header>
    </>
  );
};

export default Header;
