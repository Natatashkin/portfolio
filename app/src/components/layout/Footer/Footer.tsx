import SocialLinks, { type SocialLink } from '@/components/ui/SocialLinks';
import styles from './Footer.module.scss';

type Props = {
  copyright: string | null;
  socialLinks: SocialLink[];
};

const Footer = ({ copyright, socialLinks }: Props) => (
  <footer className={styles.footer}>
    {copyright && <p className={styles.footer__copyright}>{copyright}</p>}
    <SocialLinks items={socialLinks} />
  </footer>
);

export default Footer;
