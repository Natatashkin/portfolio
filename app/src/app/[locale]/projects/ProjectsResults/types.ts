import type { Locale } from 'next-intl';
import type { FilterItem } from '@/components/ui/Filter';

export type ProjectsResultsProps = {
  locale: Locale;
  // The filter options from the page query, in slug order.
  items: FilterItem[];
  searchParams: PageProps<'/[locale]/projects'>['searchParams'];
};
