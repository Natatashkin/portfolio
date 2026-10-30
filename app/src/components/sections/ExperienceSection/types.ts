import type { SectionOf } from '@/lib/sanity/types';

export type ExperienceItem = NonNullable<
  SectionOf<'experienceSection'>['experiences']
>[number];
