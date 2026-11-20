import { Suspense } from 'react';
import ProjectsList from '@/components/ui/ProjectsList';
import ProjectsCount from './ProjectsCount';
import ResultsFrame, { SkeletonGrid } from './ResultsFrame';
import type { ProjectsResultsProps } from './types';

// Normalization, the only place it is written: each `filter` value is checked against the options, unknown ones are
// dropped, and the rest is deduplicated and put in option order. The result is the cache key of `fetchProjects`, so
// an arbitrary URL maps to an existing entry.
const normalizeFilters = (
  raw: string | string[] | undefined,
  items: ProjectsResultsProps['items']
): string[] => {
  const requested = new Set(typeof raw === 'string' ? [raw] : (raw ?? []));

  return items
    .map(({ value }) => value)
    .filter((value) => requested.has(value));
};

// Reads `searchParams`, the only request data of the page, inside its own `<Suspense>`.
const Results = async ({
  locale,
  items,
  searchParams
}: ProjectsResultsProps) => {
  const filters = normalizeFilters((await searchParams).filter, items);
  const filterKey = filters.join(',');

  return (
    <ResultsFrame
      items={items}
      value={filters}
      count={
        <Suspense key={filterKey} fallback={null}>
          <ProjectsCount locale={locale} filters={filters} />
        </Suspense>
      }
      list={
        <Suspense key={filterKey} fallback={<SkeletonGrid />}>
          <ProjectsList locale={locale} filters={filters} />
        </Suspense>
      }
    />
  );
};

// Until the request arrives, the frame shows the chips with nothing selected and the skeletons.
const ProjectsResults = (props: ProjectsResultsProps) => (
  <Suspense
    fallback={
      <ResultsFrame
        items={props.items}
        value={[]}
        count={null}
        list={<SkeletonGrid />}
      />
    }
  >
    <Results {...props} />
  </Suspense>
);

export default ProjectsResults;
