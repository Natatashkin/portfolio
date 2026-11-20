import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import SectionRenderer from '@/components/sections/SectionRenderer';
import { routing } from '@/i18n/routing';
import { fetchPage } from '@/lib/sanity/api/fetchPage';

const HomePage = async ({ params }: PageProps<'/[locale]'>) => {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const page = await fetchPage('home', locale);

  if (!page) notFound();

  return (
    <main id="main-content">
      <SectionRenderer sections={page.sections ?? []} />
    </main>
  );
};

export default HomePage;
