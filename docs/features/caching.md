# Caching (Cache Components)

Status: draft

## Goal

Keep every page served from a static shell while a page can still read request data (`?filter=` on the
[projects page](projects-page.md)). Editors still see a Studio change within moments of publishing.

## Requirements

- [ ] `cacheComponents: true` in `app/next.config.ts`.
- [ ] Each Sanity fetcher in `app/src/lib/sanity/api/` (`fetchPage`, `fetchProjects`, `fetchSiteSettings`) is a cached
      function: `'use cache'`, `cacheTag(...)` with the existing tag arrays (`PAGE_QUERY_TAGS`,
      `PROJECTS_QUERY_TAGS`, `SITE_SETTING_QUERY_TAGS`) and a 30-minute
      `cacheLife` (`cacheLife({ revalidate: 1800 })`).
- [ ] The fetchers drop `next: { tags }` from `client.fetch`: inside `'use cache'` the tags come from `cacheTag`.
- [ ] `export const revalidate = 3600` is removed from `app/[locale]/page.tsx`; the `cacheLife` is the fallback if a
      webhook is missed.
- [ ] The webhook `api/revalidate` stays the freshness path: a changed `page`, `project`, `technology`, `skill` or
      other document still refreshes the content through `revalidateTag`. The webhook and its `TAG_BY_TYPE` map are
      unchanged, and no tag array is duplicated: `PAGE_QUERY_TAGS` already holds `page`, `project`, `technology` and
      `skill`, so one edit to any of them invalidates the page data, including the projects filter options
      ([projects-page.md](projects-page.md)). A type whose tag differs from its name keeps its `TAG_BY_TYPE` entry.
- [ ] Request data (`searchParams`, `cookies`, `headers`) is read only in a component below a shell that reads no
      request data, inside a `<Suspense>` boundary, never in the page component itself.
- [ ] The static shell of every route is prerendered; the home page stays fully static, `/[locale]/projects` is
      partially prerendered (shell static, the list streams).
- [ ] The locale reaches cached code as a fetcher argument, never through a request API; every argument of a cached
      function is serializable (locale, slug, and the filter list). The filter list must be normalized first (sorted,
      deduplicated): the rule is in [projects-page.md](projects-page.md).
- [ ] The documented Sanity webhook filter lists every type in `PAGE_QUERY_TAGS` (including `project` and
      `experience`), so no tagged type misses an invalidation.

## Design

- **Schema:** none.
- **Query:** no GROQ change. `client.fetch` keeps `useCdn: false`; Next's cache is the only staleness layer
  ([D30](../decisions.md)).
- **UI:** none. Pages follow one pattern: a shell that reads no request data, and the request-dependent part in an
  async child wrapped in `<Suspense>` with a fallback that matches its layout
  ([loading-states.md](loading-states.md)).
- **Locale:** `i18n/request.ts` already reads the locale through `next/root-params`, which fits Cache Components;
  `[locale]/layout.tsx` has `generateStaticParams` over the locales.
- **Edge cases:** a missed webhook leaves content stale for at most 30 minutes; request values are normalized before
  the fetch ([projects-page.md](projects-page.md)), so an arbitrary URL creates no extra cache entries.

## Files

- `app/next.config.ts`: the flag (a build config change; the author approves it).
- `app/src/lib/sanity/api/fetchPage.ts`, `fetchProjects.ts`, `fetchSiteSettings.ts`: cached fetchers.
- `app/src/app/[locale]/page.tsx`: `revalidate` removed.
- `app/src/app/api/revalidate/route.ts`: unchanged; it is the freshness path.
- Docs: `specs/architecture.md` (Rendering and data flow), `decisions.md` (D30).

## Acceptance criteria

- [ ] `pnpm build` prerenders every route; `/[locale]/projects` is reported as partially prerendered, home as static.
- [ ] After a Studio change and a webhook call, the next request shows the new content in both locales.
- [ ] No `searchParams` read outside `<Suspense>` (the build fails otherwise).
- [ ] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`.

## Decisions

- Cache Components, a 30-minute `cacheLife` and tags from `cacheTag`: [D30](../decisions.md).

## Tasks

1. Read the Next.js guides in `node_modules/next/dist/docs/` (migrating to Cache Components, ISR with Cache
   Components) and the current next-intl docs.
2. Set the flag, convert the three fetchers, remove `revalidate` from the home page. Done when `pnpm build` passes and
   every route prerenders.
3. Author: update the webhook filter in the Sanity dashboard to include every `PAGE_QUERY_TAGS` type (add `project`
   and `experience`; the documented list is in `specs/architecture.md`). Then check that the webhook still refreshes
   content.
4. Sync: `docs-writer` updates `architecture.md` and marks the spec `done`.

## Open questions

- None.
