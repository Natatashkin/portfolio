# Projects page

Status: approved

## Goal

A page at `/projects` (`/uk/projects`) that lists every public project as a card, with a technology filter kept in
the URL (`?filter=`) so a filtered view can be shared, followed by any sections the author adds to the page in
Sanity. The details page `projects/[slug]`, the header, sitemap, hreflang, Open Graph and animation on
this page are out of scope.

## Requirements

- [ ] Order: breadcrumbs `Home / Projects` → `h1` and subtitle → filter → project counter → card grid → the page's
      sections from Sanity. Header and footer come from the locale layout unchanged.
- [ ] Breadcrumbs: `nav` with an accessible name and an `ol`; `Home` is a locale-aware link, `Projects` is plain text
      with `aria-current="page"`.
- [ ] Grid, breakpoints and card alignment are the same as in the home projects section.
- [ ] Every project with a `slug` and a `title` (after the `en` fallback) is shown, in the Studio drag-and-drop order.
- [ ] Cards are the home page `ProjectCard`, reused as is; links to `projects/<slug>` stay `#`.
- [ ] Filter: `All` plus every technology and skill shown on the listed cards, collected from the data, in
      alphabetical order; one active at a time. Each chip exposes its state (`aria-pressed`), the group has an
      accessible name, touch targets meet the accessibility minimum.
- [ ] URL: the page opens without a parameter, `All` active. Picking a chip sets `?filter=<key>`; `All` removes it.
      A shared URL opens filtered, in either locale. An unknown or empty key acts as `All`. A change does not scroll
      the page and does not add a history entry per click.
- [ ] Stable layout: a filter change does not make the page jump. The results area keeps a minimum height (the value
      is chosen and checked in the browser in task 5), so an empty or short result does not pull the footer up.
- [ ] Counter: "N projects" with plural forms for `en` and `uk` (ICU), announced politely on change.
- [ ] Empty state: when the filter matches nothing, a message and a control that clears the filter. Without any
      projects: the message only.
- [ ] Mobile: the filter is one row with horizontal scroll, edge to edge, no visible scrollbar; a focused chip
      scrolls into view.
- [ ] Headings: `h1` → a visually hidden `h2` above the grid (localized, e.g. "Project list") → the card `h3`s; a
      section headline after the grid is an `h2`. No level is skipped.
- [ ] The page renders the sections of the `page` document with slug `projects` through `SectionRenderer` after the
      grid. Any section type the author adds in Studio works, as on home; the page does not depend on a particular
      one. Without that document, or with no sections, the page renders without them.
- [ ] Without JavaScript all projects are visible; the filter is a progressive enhancement.
- [ ] `generateMetadata`: localized `title` and `description` for `en` and `uk`; the layout's pre-launch
      `noindex` stays.
- [ ] Localized fields fall back to `en` when the page locale is empty.
- [ ] Light and dark themes through tokens; reduced motion removes the card transitions.

## Design

- **Schema:**
  - `project` is unchanged; its hidden `orderRank` (`@sanity/orderable-document-list`) holds the Studio order.
  - `page` gets an optional `description` (loc richText): the page intro, e.g. the `/projects` lead, distinct from
    `seo.description`. The page query and UI do not read it yet.
- **Query:**
  - `PROJECTS_QUERY` in `app/src/lib/sanity/queries.ts`: projects with a slug, ordered by `orderRank`, with the same
    project projection as the `projectsSection` branch; each technology and skill also returns a locale-independent
    filter label (technology `name`, skill `en` title). Tags `project`, `technology`, `skill`. Fetcher
    `fetchProjects`, type from TypeGen. The title check stays in code.
  - The page reads its sections with `fetchPage('projects', locale)` and the existing `PAGE_QUERY`; a section type
    without a query branch or a `SectionRenderer` case is skipped, as on home.
- **UI:**
  - Route `app/src/app/[locale]/projects/page.tsx` replaces the stub: Server Component, same `revalidate` as home,
    `generateMetadata` via `getTranslations`, sections through `SectionRenderer` after the grid. It does not read
    `searchParams`, so the route stays static.
  - The part that reads `?filter=` (`useSearchParams`) sits in a `Suspense` boundary, as Next requires for a
    prerendered route. Its fallback is the full grid, so the static HTML (and a visit without JavaScript) has every
    card. After JavaScript loads, the same grid is shown filtered in its place; on a shared filtered link the extra
    cards disappear at that moment, and the minimum height keeps the footer from jumping. Whether the card data is
    sent to the browser only once is checked in the build output in task 5.
  - URL updates use `useRouter` and `usePathname` from `@/i18n/navigation` (`replace`, no scroll), so the locale
    prefix survives.
  - Filter chips show the name in the page language (a skill title is localized, a technology name is the same in
    both). The key is a slug of the locale-independent label (`Next.js` → `nextjs`) from a helper in `lib/helpers`.
    Options with the same label merge into one chip; a label that gives an empty key is skipped.
  - `ProjectCard` comes from `components/ui/ProjectCard/` (moved from `sections/ProjectsSection/ProjectCard/`).
  - Page-private components in `components/projects/`: `Breadcrumbs` (server), `ProjectsBrowser` (client: filter,
    counter, grid, empty state), `TechFilter` (client child).
  - Look: pill-shaped filter chips, the active one in the accent colour. Colours, fonts and spacing come from the
    existing tokens. The hidden `h2` uses the `visually-hidden` mixin; page strings are in `messages` (`ProjectsPage`).
- **Edge cases:** no projects; no matches; no `projects` page document; a project without image, buttons or
  technologies; an empty `uk` field; an unknown `?filter=`; long titles and labels; a single option.
- **Known limits (out of scope):** header anchors render as `#<id>` and do nothing on `/projects`.

## Files

- `sanity-cms/schemaTypes/documents/page.ts` (`description`).
- `app/src/lib/sanity/queries.ts`, `app/src/lib/sanity/api/fetchProjects.ts`, `app/src/sanity.types.ts`.
- `app/src/app/[locale]/projects/page.tsx`.
- `app/src/components/ui/ProjectCard/` (moved) and `app/src/components/sections/ProjectsSection/` (import).
- `app/src/components/projects/{Breadcrumbs,ProjectsBrowser,TechFilter}/`.
- `app/src/lib/helpers/` (filter key helper), `app/messages/{en,uk}.json` (`ProjectsPage`).
- Docs: `CLAUDE.md` (Out of scope), `specs/product.md`, `specs/content-model.md`, `conventions.md`, `features/ui-blocks.md`, `decisions.md`,
  `features/README.md`, and the specs that call `projects/` a stub.

## Acceptance criteria

- [ ] `/projects` and `/uk/projects` render in light and dark at 1400, 1040, 800, 700 and 390 px, with the same
      grid and card alignment as home.
- [ ] The home projects section and every existing `LinkButton` behave as before.
- [ ] Filter, shared URL (also across locales), unknown key, empty state and Back behave as required; the footer
      does not jump on a filter change.
- [ ] With the author's `projects` page content, its sections render after the grid in both locales; without the
      document the page renders without them.
- [ ] Keyboard order and visible focus through breadcrumbs, chips and card controls.
- [ ] Empty or unexpected CMS data does not throw.
- [ ] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`; the route is
      static in the build output. Studio builds (`pnpm build` in `sanity-cms/`).

## Decisions

- The list page moves into scope; the details page stays out, so the card links to `projects/<slug>` stay `#`
  ([D26](../decisions.md)).
- The card is reused unchanged and moves to `ui/` because two pages share it (as `TagList` in D23); a hidden `h2`
  keeps the heading order instead of a prop on the card.
- Content after the grid is the `projects` page's own sections, so the author composes it in Studio from any section
  type; the page is not tied to one.
- The order comes from `orderRank` (D26).
- The filter key is locale-independent, so a shared link works in both locales; the parameter is `filter`, since it
  covers skills too.
- Client-side filtering on a static page: no dynamic rendering for one query parameter; the brief unfiltered view on
  a shared link is accepted.

## Tasks

1. Docs: `docs-writer` updates the docs listed under Files. Done when the author approves those edits and this spec.
2. Query, tags, fetcher, TypeGen. Done when both locales return the dataset's projects in Studio order.
3. Shared card: move as is. Done when home is unchanged.
4. Page shell: route, metadata, breadcrumbs, heading, full grid. Done when both locales render and the route is
   static.
5. Filter, counter, empty state, minimum height, mobile row. Done when the filter criteria pass in the browser.
6. Sections on the page: render `fetchPage('projects')` sections through `SectionRenderer`. Done when, after the
   author adds the `projects` page in Studio, its sections render in both locales.
7. Sync: `docs-writer` updates the specs to the code. Done when the author marks the feature `done`.

## Open questions

None.
