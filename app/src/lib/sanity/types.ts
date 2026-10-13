import type { PAGE_QUERY_RESULT } from '@/sanity.types';

export type Section = NonNullable<
  NonNullable<PAGE_QUERY_RESULT>['sections']
>[number];

export type SectionOf<T extends Section['_type']> = Extract<
  Section,
  { _type: T }
>;
