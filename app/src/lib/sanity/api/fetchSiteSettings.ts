import type { routing } from '@/i18n/routing';
import { client } from '@/lib/sanity/client';
import {
  SITE_SETTING_QUERY_TAGS,
  SITE_SETTINGS_QUERY
} from '@/lib/sanity/queries';

type Locale = (typeof routing.locales)[number];

export const fetchSiteSettings = (locale: Locale) =>
  client.fetch(
    SITE_SETTINGS_QUERY,
    { locale },
    { next: { tags: [...SITE_SETTING_QUERY_TAGS] } }
  );
