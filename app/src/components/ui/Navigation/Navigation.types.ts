import type { SITE_SETTINGS_QUERY_RESULT } from '@/sanity.types';

export type NavigationItem = NonNullable<
  NonNullable<SITE_SETTINGS_QUERY_RESULT>['navigation']
>[number];
