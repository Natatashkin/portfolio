import type { routing } from '@/i18n/routing';
import { client } from '@/lib/sanity/client';
import { PROJECTS_QUERY, PROJECTS_QUERY_TAGS } from '@/lib/sanity/queries';

type Locale = (typeof routing.locales)[number];

export const fetchProjects = (locale: Locale) =>
  client.fetch(
    PROJECTS_QUERY,
    { locale },
    { next: { tags: [...PROJECTS_QUERY_TAGS] } }
  );
