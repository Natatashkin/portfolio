import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import SectionRenderer from '@/components/sections/SectionRenderer';
import { routing } from '@/i18n/routing';
import { fetchPage } from '@/lib/sanity/api/fetchPage';

const ProjectsPage = async ({ params }: PageProps<'/[locale]/projects'>) => {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const page = await fetchPage('projects', locale);

  if (!page) notFound();

  return (
    <main id="main-content">
      <h1>Projects</h1>
      <SectionRenderer sections={page.sections ?? []} />
    </main>
  );
};

export default ProjectsPage;
