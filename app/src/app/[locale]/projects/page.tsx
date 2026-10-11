import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';

const ProjectsPage = async ({ params }: PageProps<'/[locale]/projects'>) => {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <main id="main-content">
      <h1>Projects</h1>
    </main>
  );
};

export default ProjectsPage;
