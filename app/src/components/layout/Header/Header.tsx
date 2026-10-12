import { useTranslations } from 'next-intl';
import BurgerMenu from '@/components/layout/BurgerMenu';
import Container from '@/components/ui/Container';
import Logo from '@/components/ui/Logo';
import Navigation, { type NavigationItem } from '@/components/ui/Navigation';
import SocialLinks, { type SocialLink } from '@/components/ui/SocialLinks';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import styles from './Header.module.scss';

type Props = {
  navigation: NavigationItem[];
  siteName: string | null;
  socialLinks: SocialLink[];
};

const Header = ({ navigation, siteName, socialLinks }: Props) => {
  const t = useTranslations('Header');

  return (
    <>
      <a className={styles.header__skipLink} href="#main-content">
        {t('skipToContent')}
      </a>
      <header className={styles.header}>
        <Container>
          <div className={styles.header__container}>
            {siteName && <Logo name={siteName} />}
            <div className={styles.header__desktop}>
              <Navigation items={navigation} label={t('navigation')} />
              <ThemeSwitcher />
            </div>
            <BurgerMenu>
              <Navigation items={navigation} label={t('navigation')} />
              <ThemeSwitcher />
              <div className={styles.header__social}>
                <SocialLinks items={socialLinks} />
              </div>
            </BurgerMenu>
          </div>
        </Container>
      </header>
    </>
  );
};

export default Header;
