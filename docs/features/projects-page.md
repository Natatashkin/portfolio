# Projects page

Status: approved

## Goal

`/projects` (`/uk/projects`) lists every project as a card grid that the visitor can filter by technology or skill, with
several filters at once. The author controls the title, the intro and the sections below the list (the "Under NDA" CTA)
in Studio.

Depends on: [caching.md](caching.md), [breadcrumbs.md](breadcrumbs.md), [filter.md](filter.md),
[loading-states.md](loading-states.md), [cta-section.md](cta-section.md). The project details page
`projects/[slug]` stays out of scope, so project links stay `#`.

## Requirements

- [ ] Order on the page: Breadcrumbs `Home / Projects` → `h1` → description → Filter → counter → card grid (or the
      empty state) → the `page.sections` through `SectionRenderer`.
- [ ] The `h1` is the localized `page.title` ([D32](../decisions.md)); the description is the localized rich text
      `page.description`. Both fall back to `en`; the description is optional and leaves no empty wrapper.
- [ ] `notFound()` only when the `page` document with slug `projects` is missing. It runs in the shell (`params` and
      the cached `fetchPage`), which resolves at prerender, so a missing document is known at build time per locale
      (`generateStaticParams`) and the prerendered route is the 404. Loading and empty results never call it.
- [ ] The Filter chips are the technologies and skills that have a `slug` and are referenced by at least one eligible
      project, ordered by slug ([D31](../decisions.md)); in `uk` the labels may therefore not look alphabetical, which
      is intended. Eligible: the same rule as `ProjectsSection` (a slug and a title after the `en` fallback).
- [ ] Multi-select through repeated `?filter=<slug>` params ([filter.md](filter.md)). A project must reference all
      selected slugs (AND). Projects keep the Studio `orderRank` order (see Decisions).
- [ ] Normalization (the only place this rule is written): each `filter` value is checked against the options;
      unknown values are dropped, the rest is deduplicated and sorted in option order. The normalized list is the
      fetch and cache key, so an arbitrary URL creates no cache entries beyond valid combinations. No valid value
      means all projects. `filterKey` = the normalized `filters.join(',')`.
- [ ] The counter shows the number of shown projects ("N projects", ICU plural in `en` and `uk`). The
      `role="status"` element is persistent and never remounted; only the text inside it is keyed. It reads 0 for an
      empty result.
- [ ] Empty result (valid filters, no project matches): a localized "No projects match these filters" message and a
      "Reset filters" link (locale-aware `Link` to `/projects`, `replace`, `scroll={false}`), the same as "All".
- [ ] The grid is the same as in `ProjectsSection` (1 column, 2 from `md`, 3 from `lg`), shared through one SCSS mixin
      in `_mixins.scss`, and uses `ProjectCard` from `components/ui/`.
- [ ] While the list loads, a grid of `ProjectCardSkeleton`s shows ([loading-states.md](loading-states.md)). The
      results container has a `min-height` of one card row per breakpoint, taken from the skeleton height, so the
      footer does not jump.
- [ ] While the filter changes, the results dim (Filter's `data-pending`), then the skeletons show, then the cards.
- [ ] The "All projects" button of `ProjectsSection` uses its Studio link again (the temporary `url="#"` is removed).
- [ ] The project links on cards stay `#` (details page out of scope; the existing placeholders remain).
- [ ] `searchParams` is read once, in `ProjectsResults`, inside `<Suspense>` ([caching.md](caching.md)).
- [ ] Counter, empty-state and filter strings are in `messages/{uk,en}.json` (`Filter.all`, `Filter.reset`, the
      counter and the empty message).
- [ ] Light and dark themes through tokens, at the breakpoints of the other sections; the page has one `h1`.

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
    interpolation: `defined(slug.current) && (defined(title[language == $locale][0].value) &&
title[language == $locale][0].value != "" || defined(title[language == "en"][0].value) &&
title[language == "en"][0].value != "")`. The counter therefore matches the cards.
  - `fetchProjects(locale, filters)` with `PROJECTS_QUERY` takes the normalized list (`$filters`) and applies the
    eligibility. Matching: `count($filters) == 0 || count(*[_type in ["technology", "skill"] && slug.current in
$filters && _id in ^.technologies[]._ref]) == count($filters)` (the subquery counts each referenced document once).
    The `filterLabel` projection and its comment are removed from `queries.ts`.
  - TypeGen infers `PROJECTS_QUERY` as `Array<never>` because of the `$filters` condition, so `fetchProjects` types its
    result with `ProjectItem` from `lib/sanity/types.ts`, the generated type of the same projection in the
    `projectsSection` branch (see Decisions).
- **UI:** `app/[locale]/projects/page.tsx` is a shell that reads no request data. It awaits `params` and `fetchPage`,
  calls `notFound()` if the page is missing, and renders Breadcrumbs, `h1`, `RichText`, `SectionRenderer` and an outer
  `<Suspense>` around `ProjectsResults`, passing `filters` as props.
  - `ProjectsResults` (private to the page, async Server Component) never fetches options: it awaits `searchParams`,
    validates against the given options, and renders `<Filter value items />`, the counter and an inner
    `<Suspense key={filterKey} fallback={skeleton grid}>` with `ProjectsList`.
  - Counter: a persistent `role="status"` element rendered by `ProjectsResults`, outside the keyed boundary, so it is
    not remounted on a change. Inside it, a small `<Suspense key={filterKey}>` with an empty fallback renders the count
    text from the same cached `fetchProjects(locale, filters)` call as `ProjectsList`. The `'use cache'` entry is
    shared, so there is no second Sanity request. The status line keeps its height while empty, so nothing shifts.
  - The outer fallback renders the chips (none active) and the skeleton grid; the options come from the shell, so
    the chips are right even there. On a direct link a brief "no chip active" state shows until `ProjectsResults`
    renders; this is expected.
  - `ProjectsList` (`components/ui/ProjectsList/`, async Server Component) calls `fetchProjects` and renders the
    `ProjectCard` grid or the empty state.
- **Edge cases:** no filters renders only "All"; a project without a title or slug is skipped as in
  `ProjectsSection`; no `page.sections` renders nothing after the grid; one locale empty falls back to `en`.

## Files

- `app/src/app/[locale]/projects/page.tsx` (and the private `ProjectsResults`): the page.
- `app/src/components/ui/ProjectsList/`: the grid and the empty state.
- `app/src/lib/sanity/queries.ts`, `api/fetchPage.ts`, `api/fetchProjects.ts`, `app/src/sanity.types.ts`.
- `app/src/styles/_mixins.scss`, `components/sections/ProjectsSection/`: shared grid mixin; the button `url` restored.
- `app/messages/{uk,en}.json`: counter, empty state, `Filter.reset`.
- `sanity-cms/schemaTypes/documents/page.ts`, `technology.ts`, `skill.ts`.

## Acceptance criteria

- [ ] `/en/projects` opens with "All" active, the full list and the CTA at the bottom; `/uk/projects` the same in
      Ukrainian.
- [ ] A chip click updates the params without a scroll jump or a new history entry; the chip changes at once, the
      grid dims, the skeletons show, then the results.
- [ ] A direct `?filter=a&filter=b` link opens with both chips active in both locales; unknown values are dropped and
      all-unknown shows all projects.
- [ ] A combination with no match shows the empty state, the counter says 0, and "Reset filters" restores the list.
- [ ] The counter uses the right plural form (en: 1, 2; uk: 1, 2, 5, 21) and is announced politely.
- [ ] Skeletons cause no layout shift and the footer does not jump (checked with throttling).
- [ ] The last breadcrumb is not a link; the "All projects" button on the home page leads here.
- [ ] A missing `projects` page document gives the localized 404 with a 404 status (to confirm with `pnpm build` and
      `curl -I`).
- [ ] On a direct `?filter=` link the outer fallback briefly shows no active chip before the real chips; expected.
- [ ] The home page query returns `filters: null` and its data is unchanged.
- [ ] `pnpm build` reports `/[locale]/projects` as partially prerendered.
- [ ] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`; Studio builds.

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
- No metadata, hreflang, JSON-LD or animation here: they belong to "Page metadata and SEO" and the animation work.

## Tasks

1. Cache Components ([caching.md](caching.md)).
2. Schema changes (`page.title`, `slug` on technology and skill) and TypeGen.
3. CTA section ([cta-section.md](cta-section.md)).
4. Breadcrumbs, ProjectCardSkeleton, Filter (their specs).
5. Queries (`$filters` param, eligibility in GROQ, `filters` in `PAGE_QUERY`, the obsolete `PROJECTS_QUERY` comment and
   `filterLabel` removed), `fetchProjects(locale, filters)`, the page, `ProjectsList`, the shared grid mixin, the
   restored "All projects" url.
6. Browser check: filter flow, both locales, throttling, `prefers-reduced-motion`, Lighthouse.
7. Sync: `docs-writer` marks the spec `done` and updates `roadmap.md`, `content-model.md`, `architecture.md`.

## Open questions

- None.
