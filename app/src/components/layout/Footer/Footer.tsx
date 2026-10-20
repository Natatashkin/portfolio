import Container from '@/components/ui/Container';
import SocialLinks, { type SocialLink } from '@/components/ui/SocialLinks';
import styles from './Footer.module.scss';

type Props = {
  copyright: string | null;
  socialLinks: SocialLink[];
};

const Footer = ({ copyright, socialLinks }: Props) => (
  <footer className={styles.footer}>
    <Container>
      <div className={styles.footer__container}>
        {copyright && <p className={styles.footer__copyright}>{copyright}</p>}
        <SocialLinks items={socialLinks} />
      </div>
    </Container>
  </footer>
);

export default Footer;
