import { cacheLife, cacheTag } from 'next/cache';
import type { Locale } from 'next-intl';
import { client } from '@/lib/sanity/client';
import {
  PAGE_QUERY,
  PAGE_QUERY_TAGS,
  QUERY_REVALIDATE_SECONDS
} from '@/lib/sanity/queries';

export const fetchPage = async (slug: string, locale: Locale) => {
  'use cache';
  cacheTag(...PAGE_QUERY_TAGS);
  cacheLife({ revalidate: QUERY_REVALIDATE_SECONDS });

  return client.fetch(PAGE_QUERY, { slug, locale });
};
