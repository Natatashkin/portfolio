# Projects page

Status: done

## Goal

`/projects` (`/uk/projects`) lists every project as a card grid that the visitor can filter by technology or skill, with
several filters at once. The author controls the title, the intro and the sections below the list (the "Under NDA" CTA)
in Studio.

Depends on: [caching.md](caching.md), [breadcrumbs.md](breadcrumbs.md), [filter.md](filter.md),
[loading-states.md](loading-states.md), [cta-section.md](cta-section.md). The project details page
`projects/[slug]` stays out of scope, so project links stay `#`.

## Requirements

- [x] Order on the page: Breadcrumbs `Home / Projects` → `h1` → description → Filter → counter → card grid (or the
      empty state) → the `page.sections` through `SectionRenderer`.
- [x] The `h1` is the localized `page.title` ([D32](../decisions.md)); the description is the localized rich text
      `page.description`. Both fall back to `en` in the query; the description is optional and leaves no empty wrapper.
- [x] `notFound()` only when the `page` document with slug `projects` is missing (or the locale is invalid). It runs in
      the shell (`params` and the cached `fetchPage`), never in the streamed part: loading and empty results never call
      it.
- [x] The Filter chips are the technologies and skills that have a `slug` and are referenced by at least one eligible
      project, ordered by slug ([D31](../decisions.md)); in `uk` the labels may therefore not look alphabetical, which
      is intended. Eligible: the same rule as `ProjectsSection` (a slug and a title after the `en` fallback).
- [x] Multi-select through repeated `?filter=<slug>` params ([filter.md](filter.md)). A project must reference all
      selected slugs (AND). Projects keep the Studio `orderRank` order (see Decisions).
- [x] Normalization (the only place this rule is written, in `ProjectsResults`): each `filter` value is checked against
      the options; unknown values are dropped, the rest is deduplicated and sorted in option order. The normalized list
      is the fetch and cache key, so an arbitrary URL creates no cache entries beyond valid combinations. No valid
      value means all projects. `filterKey` = the normalized `filters.join(',')`.
- [x] The counter shows the number of shown projects ("N projects", ICU plural in `en` and `uk`). The
      `role="status"` element is persistent and not remounted on a filter change; only the text inside it is keyed. It
      reads 0 for an empty result.
- [x] Empty result (valid filters, no project matches): a localized "No projects match these filters." message and a
      "Reset filters" link (locale-aware `Link` to `/projects`, `replace`, `scroll={false}`, the `chip` look), the same
      as "All".
- [x] The grid is the same as in `ProjectsSection` (1 column, 2 from `md`, 3 from `lg`), shared through the
      `project-grid` mixin in `_mixins.scss`, and uses `ProjectCard` from `components/ui/`.
- [x] While the list loads, a grid of three `ProjectCardSkeleton`s shows ([loading-states.md](loading-states.md)). An
      invisible one-skeleton grid row under the list reserves one card row of height at every breakpoint, so the footer
      does not jump between skeletons, cards and the empty state.
- [x] While the filter changes, the results dim (Filter's `data-pending`), then the skeletons show, then the cards.
- [x] The "All projects" button of `ProjectsSection` uses its Studio link again (the temporary `url="#"` is removed).
- [x] The project links on cards stay `#` (details page out of scope; the existing placeholders remain).
- [x] `searchParams` is read once, in `ProjectsResults`, inside `<Suspense>` ([caching.md](caching.md)); the page
      passes it on as an unawaited promise.
- [x] Counter, empty-state and filter strings are in `messages/{uk,en}.json` (`Filter.all`, `Filter.reset`,
      `ProjectsResults.count`, `ProjectsResults.filterLabel`, `ProjectsList.empty`).
- [x] The page has one `h1`; card titles are `h2` here (`ProjectCard` `headingLevel`) and `h3` on the home page.
- [x] Light and dark themes through tokens, at the breakpoints of the other sections.

## Design

- **Schema:** `page.title` localized ([D32](../decisions.md)); `slug` on `technology` and `skill`
  ([D31](../decisions.md)). Fields: [content-model.md](../specs/content-model.md). The author re-enters the page
  titles and fills the slugs in Studio.
- **Data:** two cached fetchers for the page data ([caching.md](caching.md), including the tags; the layout's
  `fetchSiteSettings` is separate), no separate filter-options request.
  - `fetchPage(slug, locale)` with `PAGE_QUERY` returns the localized `title`, `description`, `sections` and `filters`.
  - `filters` (`{ slug, label }[]`) is computed only when `$slug == "projects"` (`select(...)`, `null` otherwise), so
    the home page pays nothing: technologies and skills with `defined(slug.current)` and
    `_id in *[_type == "project" && <eligible>].technologies[]._ref`, projecting
    `{ "slug": slug.current, "label": ... }` (technology `name`; skill localized title with the `en` fallback),
    `order(slug.current asc)`.
  - Eligibility `<eligible>`, defined once and repeated literally in both queries because TypeGen cannot read
    interpolation: `defined(slug.current)` and a non-empty title in the locale or in `en`. The counter therefore
    matches the cards.
  - `fetchProjects(locale, filters)` with `PROJECTS_QUERY` takes the normalized list (`$filters`) and applies the
    eligibility. Matching: `count($filters) == 0 || count(*[_type in ["technology", "skill"] && slug.current in
$filters && _id in ^.technologies[]._ref]) == count($filters)` (the subquery counts each referenced document once).
  - TypeGen infers `PROJECTS_QUERY` as `Array<never>` because of the `$filters` condition, so `fetchProjects` types its
    result with `ProjectItem` from `lib/sanity/types.ts`, the generated type of the same projection in the
    `projectsSection` branch (see Decisions). GROQ comments in both queries ask to keep the projections in sync.
- **UI:** `app/[locale]/projects/page.tsx` is a shell that reads no request data. It awaits `params` and `fetchPage`,
  calls `notFound()` if the page is missing, and renders Breadcrumbs, `h1`, `RichText`, `ProjectsResults` (with the
  options and the unawaited `searchParams`) and `SectionRenderer`. The top padding is the `--header-offset` token, shared
  with the hero.
  - `ProjectsResults` (private to the page; `ProjectsResults.tsx`, `ResultsFrame.tsx`, `ProjectsCount.tsx`) owns the
    outer `<Suspense>`. Inside it an async component awaits `searchParams`, normalizes against the options and renders
    `ResultsFrame` with a keyed `<Suspense key={filterKey} fallback={skeleton grid}>` around `ProjectsList`.
  - `ResultsFrame` is the layout of the results: `<Filter value items />`, the counter and the list area. The loading
    fallback renders the same frame, so nothing moves when the real results arrive.
  - Counter: a persistent `role="status"` element in `ResultsFrame`, outside the keyed boundary. Inside it, a small
    `<Suspense key={filterKey}>` with an empty fallback renders the count text (`ProjectsCount`) from the same cached
    `fetchProjects(locale, filters)` call as `ProjectsList`. The `'use cache'` entry is shared, so there is no second
    Sanity request. The status line keeps its one-line height while empty, so nothing shifts.
  - The outer fallback renders the chips (none active) and the skeleton grid; the options come from the shell, so the
    chips are right even there. On a direct link a brief "no chip active" state shows until the request is read; this
    is expected.
  - `ProjectsList` (`components/ui/ProjectsList/`, async Server Component) calls `fetchProjects` and renders the
    `ProjectCard` grid or the empty state; `isProjectCardItem` (`lib/helpers`) skips an item without title or slug.
- **Edge cases:** no filters renders only "All"; no `page.sections` renders nothing after the grid; one locale empty
  falls back to `en`.

## Files

- `app/src/app/[locale]/projects/`: `page.tsx`, `page.module.scss` and the private `ProjectsResults/`.
- `app/src/components/ui/ProjectsList/`: the grid and the empty state.
- `app/src/components/ui/ProjectCard/`: `headingLevel` prop.
- `app/src/lib/sanity/queries.ts`, `api/fetchPage.ts`, `api/fetchProjects.ts`, `types.ts` (`ProjectItem`),
  `lib/helpers/projects.ts` (`isProjectCardItem`), `app/src/sanity.types.ts`.
- `app/src/styles/_mixins.scss` (`project-grid`, `chip`), `_tokens.scss` (`--header-offset`),
  `components/sections/ProjectsSection/`: the shared mixins and the restored button `url`.
- `app/messages/{uk,en}.json`: `ProjectsResults`, `ProjectsList`, `Filter.reset`.
- `sanity-cms/schemaTypes/documents/page.ts`, `technology.ts`, `skill.ts`, `lib/filterSlug.ts`.

## Acceptance criteria

- [x] `/en/projects` opens with "All" active, the full list and the CTA at the bottom; `/uk/projects` the same in
      Ukrainian.
- [x] A chip click updates the params without a scroll jump or a new history entry; the chip changes at once, the
      grid dims, the skeletons show, then the results.
- [x] A direct `?filter=a&filter=b` link opens with both chips active in both locales; unknown values are dropped and
      all-unknown shows all projects.
- [x] A combination with no match shows the empty state, the counter says 0, and "Reset filters" restores the list.
- [x] The counter uses the right plural form (en: one, other; uk: one, few, many).
- [ ] Deferred (author decision): the counter is announced politely by a screen reader (`role="status"`).
- [x] Skeletons cause no layout shift and the footer does not jump (checked with throttling).
- [x] The last breadcrumb is not a link; the "All projects" button on the home page leads here.
- [x] A missing `projects` page document gives the localized 404 with a 404 status (to confirm with `pnpm build` and
      `curl -I`).
- [x] The home page query returns `filters: null` and its data is unchanged.
- [x] `pnpm build` reports `/[locale]/projects` as partially prerendered.
- [x] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`; Studio builds.

## Decisions

- `/projects` is in scope; the details page `projects/[slug]` is not. The list is ordered by the project's
  `orderRank`: the author already sorts projects in Studio and a numeric field would duplicate it. It is the one place
  the site reads `orderRank`.
- Filter by slug in Sanity, not in the browser: [D31](../decisions.md).
- `PROJECTS_QUERY` is typed with `ProjectItem`, not its own TypeGen result: TypeGen cannot evaluate an array
  parameter in `count($filters)` and types the query as `Array<never>`, which would turn off type checking for the list.
  `ProjectItem` is still generated (the `projectsSection` projection is the same), so nothing is typed by hand.
- Filter options ride on the page query: one request, one tag set, and no extra Sanity call for the options.
- Several filters combine with AND: a project must have all selected technologies, so an empty result is possible
  and has its own state.
- "Reset filters" is a `Link`, not a button: the empty state is a Server Component.
- The grid is shared by an SCSS mixin, not a component: the two grids have different surroundings but must stay
  identical.
- `ProjectsResults` owns the outer `<Suspense>`, so the page shell has no request data and no boundary of its own.
- The reserve row is an invisible skeleton, not a `min-height` per breakpoint: the card height depends on the
  breakpoint and the font, so a copy of the card's own box cannot drift from it.
- Card titles are `h2` on this page: no section heading sits between the page `h1` and the cards.
- `--header-offset` is a token: the hero and this page both start below the header laid over the page.
- `Locale` comes from `next-intl` (`AppConfig`) everywhere, not from a local type.
- No metadata, hreflang, JSON-LD or animation here: they belong to "Page metadata and SEO" and the animation work.

## Tasks

Done in the code.

## Open questions

- The screen-reader check of the counter is deferred (author decision); only the `role="status"` structure was
  checked.
- Lighthouse on `/projects` shows no `<title>`, no meta description and `noindex`: they belong to "Page metadata and
  SEO" and the pre-launch `noindex`.
