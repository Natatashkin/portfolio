import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import SectionRenderer from '@/components/sections/SectionRenderer';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Container from '@/components/ui/Container';
import { routing } from '@/i18n/routing';
import { fetchPage } from '@/lib/sanity/api/fetchPage';

const ProjectsPage = async ({ params }: PageProps<'/[locale]/projects'>) => {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const page = await fetchPage('projects', locale);

  if (!page) notFound();

  return (
    <main id="main-content">
      {page.title && (
        <Container>
          <Breadcrumbs items={[{ label: page.title }]} />
          <h1>{page.title}</h1>
        </Container>
      )}
      <SectionRenderer sections={page.sections ?? []} />
    </main>
  );
};

export default ProjectsPage;
