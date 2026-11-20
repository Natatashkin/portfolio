import { cacheLife, cacheTag } from 'next/cache';
import type { routing } from '@/i18n/routing';
import { client } from '@/lib/sanity/client';
import {
  QUERY_REVALIDATE_SECONDS,
  SITE_SETTING_QUERY_TAGS,
  SITE_SETTINGS_QUERY
} from '@/lib/sanity/queries';

type Locale = (typeof routing.locales)[number];

export const fetchSiteSettings = async (locale: Locale) => {
  'use cache';
  cacheTag(...SITE_SETTING_QUERY_TAGS);
  cacheLife({ revalidate: QUERY_REVALIDATE_SECONDS });

  return client.fetch(SITE_SETTINGS_QUERY, { locale });
};
