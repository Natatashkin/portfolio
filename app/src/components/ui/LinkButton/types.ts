import type { SectionOf } from '@/lib/sanity/types';

// Derived from the TypeGen result of PAGE_QUERY, so it follows the GROQ projection.
export type LinkButtonProps = NonNullable<
  SectionOf<'heroSection'>['ctaButton']
>;
