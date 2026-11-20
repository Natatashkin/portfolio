import { cacheLife, cacheTag } from 'next/cache';
import type { Locale } from 'next-intl';
import { client } from '@/lib/sanity/client';
import {
  QUERY_REVALIDATE_SECONDS,
  SITE_SETTING_QUERY_TAGS,
  SITE_SETTINGS_QUERY
} from '@/lib/sanity/queries';

export const fetchSiteSettings = async (locale: Locale) => {
  'use cache';
  cacheTag(...SITE_SETTING_QUERY_TAGS);
  cacheLife({ revalidate: QUERY_REVALIDATE_SECONDS });

  return client.fetch(SITE_SETTINGS_QUERY, { locale });
};
