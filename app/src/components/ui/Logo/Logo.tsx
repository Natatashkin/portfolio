import { Link } from '@/i18n/navigation';
import styles from './Logo.module.scss';

type Props = {
  name: string;
};

const Logo = ({ name }: Props) => (
  <Link className={styles.logo} href="/">
    {name}
  </Link>
);

export default Logo;
