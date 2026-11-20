import type { PAGE_QUERY_RESULT } from '@/sanity.types';

export type Section = NonNullable<
  NonNullable<PAGE_QUERY_RESULT>['sections']
>[number];

export type SectionOf<T extends Section['_type']> = Extract<
  Section,
  { _type: T }
>;

// One project as both project lists project it (the `projectsSection` branch and `PROJECTS_QUERY` share the
// projection). TypeGen cannot infer `PROJECTS_QUERY` itself: its `$filters` condition makes it `Array<never>`.
export type ProjectItem = NonNullable<
  SectionOf<'projectsSection'>['projects']
>[number];
