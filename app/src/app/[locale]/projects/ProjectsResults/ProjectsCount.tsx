import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { isProjectCardItem } from '@/lib/helpers';
import { fetchProjects } from '@/lib/sanity/api/fetchProjects';

type Props = {
  locale: Locale;
  filters: string[];
};

// The same cached `fetchProjects` call as the list, so it costs no second request and always matches the cards.
const ProjectsCount = async ({ locale, filters }: Props) => {
  const t = await getTranslations({ locale, namespace: 'ProjectsResults' });
  const count = (await fetchProjects(locale, filters)).filter(
    isProjectCardItem
  ).length;

  return t('count', { count });
};

export default ProjectsCount;
