import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const NotFound = () => {
  const t = useTranslations('NotFound');

  return (
    <main>
      <h1>{t('title')}</h1>
      <Link href="/">{t('backHome')}</Link>
    </main>
  );
};

export default NotFound;
