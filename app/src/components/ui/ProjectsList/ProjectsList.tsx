import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import ProjectCard from '@/components/ui/ProjectCard';
import { Link } from '@/i18n/navigation';
import { isProjectCardItem } from '@/lib/helpers';
import { fetchProjects } from '@/lib/sanity/api/fetchProjects';
import styles from './ProjectsList.module.scss';

type Props = {
  locale: Locale;
  // Normalized by the page: valid slugs in option order. It is the cache key of `fetchProjects`.
  filters: string[];
};

// The project grid of the projects page, or the empty state when no project matches the filters.
const ProjectsList = async ({ locale, filters }: Props) => {
  const [t, tFilter, allProjects] = await Promise.all([
    getTranslations({ locale, namespace: 'ProjectsList' }),
    getTranslations({ locale, namespace: 'Filter' }),
    fetchProjects(locale, filters)
  ]);
  const projects = allProjects.filter(isProjectCardItem);

  if (projects.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.empty__message}>{t('empty')}</p>
        {/* The same as "All" in the filter: no new history entry, no scroll jump. */}
        <Link
          className={styles.empty__reset}
          href="/projects"
          replace
          scroll={false}
        >
          {tFilter('reset')}
        </Link>
      </div>
    );
  }

  return (
    <ul className={styles.grid}>
      {projects.map((project) => (
        // No section heading between the page `h1` and the cards, so the card titles are `h2`.
        <ProjectCard key={project._id} project={project} headingLevel="h2" />
      ))}
    </ul>
  );
};

export default ProjectsList;
