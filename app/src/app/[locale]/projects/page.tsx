import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import SectionRenderer from '@/components/sections/SectionRenderer';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Container from '@/components/ui/Container';
import RichText from '@/components/ui/RichText';
import { routing } from '@/i18n/routing';
import { fetchPage } from '@/lib/sanity/api/fetchPage';
import styles from './page.module.scss';
import ProjectsResults from './ProjectsResults';

// The shell reads no request data: `params` is known per locale at build time and `fetchPage` is cached, so the
// shell is prerendered (and a missing page document is a prerendered 404). Only `ProjectsResults` reads the URL:
// `searchParams` is passed on as a promise and must never be awaited here, or the whole page turns dynamic.
const ProjectsPage = async ({
  params,
  searchParams
}: PageProps<'/[locale]/projects'>) => {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const page = await fetchPage('projects', locale);

  if (!page) notFound();

  const items = (page.filters ?? []).flatMap(({ slug, label }) =>
    label ? [{ label, value: slug }] : []
  );

  return (
    <main id="main-content" className={styles.page}>
      <Container>
        <div className={styles.page__intro}>
          {page.title && <Breadcrumbs items={[{ label: page.title }]} />}
          {page.title && <h1 className={styles.page__title}>{page.title}</h1>}
          {page.description && (
            <RichText
              value={page.description}
              className={styles.page__description}
            />
          )}
        </div>
        <ProjectsResults
          locale={locale}
          items={items}
          searchParams={searchParams}
        />
      </Container>
      <SectionRenderer sections={page.sections ?? []} />
    </main>
  );
};

export default ProjectsPage;
