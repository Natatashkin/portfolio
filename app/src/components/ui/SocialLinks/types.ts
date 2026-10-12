import type { SITE_SETTINGS_QUERY_RESULT } from '@/sanity.types';

export type SocialLink = NonNullable<
  NonNullable<SITE_SETTINGS_QUERY_RESULT>['socialLinks']
>[number];
