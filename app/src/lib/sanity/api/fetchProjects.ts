import { cacheLife, cacheTag } from 'next/cache';
import type { Locale } from 'next-intl';
import { client } from '@/lib/sanity/client';
import {
  PROJECTS_QUERY,
  PROJECTS_QUERY_TAGS,
  QUERY_REVALIDATE_SECONDS
} from '@/lib/sanity/queries';
import type { ProjectItem } from '@/lib/sanity/types';

// `filters` is part of the cache key, so it must already be normalized (valid slugs, deduplicated, in option
// order): an arbitrary URL then maps to an existing entry instead of creating a new one.
export const fetchProjects = async (locale: Locale, filters: string[]) => {
  'use cache';
  cacheTag(...PROJECTS_QUERY_TAGS);
  cacheLife({ revalidate: QUERY_REVALIDATE_SECONDS });

  // Typed with the shared projection: TypeGen infers `never` for this query (see `ProjectItem`).
  return client.fetch<ProjectItem[]>(PROJECTS_QUERY, { locale, filters });
};
