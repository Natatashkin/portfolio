import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';

const CasesPage = async ({ params }: PageProps<'/[locale]/cases'>) => {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <main id="main-content">
      <h1>Cases</h1>
    </main>
  );
};

export default CasesPage;
