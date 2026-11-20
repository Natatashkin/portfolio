import { cacheLife, cacheTag } from 'next/cache';
import type { routing } from '@/i18n/routing';
import { client } from '@/lib/sanity/client';
import {
  PROJECTS_QUERY,
  PROJECTS_QUERY_TAGS,
  QUERY_REVALIDATE_SECONDS
} from '@/lib/sanity/queries';

type Locale = (typeof routing.locales)[number];

export const fetchProjects = async (locale: Locale) => {
  'use cache';
  cacheTag(...PROJECTS_QUERY_TAGS);
  cacheLife({ revalidate: QUERY_REVALIDATE_SECONDS });

  return client.fetch(PROJECTS_QUERY, { locale });
};
