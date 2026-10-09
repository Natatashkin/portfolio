import type { routing } from '@/i18n/routing';
import { client } from '@/lib/sanity/client';
import { PAGE_QUERY, PAGE_QUERY_TAGS } from '@/lib/sanity/queries';

type Locale = (typeof routing.locales)[number];

export function fetchPage(slug: string, locale: Locale) {
  return client.fetch(
    PAGE_QUERY,
    { slug, locale },
    { next: { tags: [...PAGE_QUERY_TAGS] } }
  );
}
