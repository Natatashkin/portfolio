# Loading states

Status: approved

## Goal

The visitor sees that something is loading and the page does not jump when it arrives: a `Loader` for route
transitions, and a `ProjectCardSkeleton` that holds the place of a project card.

## Requirements

- [ ] `Loader`: a CSS-only indicator, animated with `transform` and `opacity` only, static under
      `prefers-reduced-motion`.
- [ ] `Loader` has `role="status"` and visually hidden text from `messages` (for example "Loading").
- [ ] `app/[locale]/loading.tsx` shows the `Loader` in the main area during route transitions and wherever a skeleton
      is not used.
- [ ] `ProjectCardSkeleton` mirrors the `ProjectCard` layout: 16:9 media, a title row, summary lines and a tag row,
      with the same box, padding and gaps, so swapping it for a card causes no layout shift.
- [ ] `ProjectCardSkeleton` is `aria-hidden` and has no text; it animates opacity only (a shimmer) and is static under
      `prefers-reduced-motion`.
- [ ] Colours come from tokens and work in light and dark themes.
- [ ] Loader and skeletons render no interactive elements.

## Design

- **Schema / Query:** none.
- **UI:**
  - `components/ui/Loader/`: Server Component, styles, `index.ts`.
  - `app/src/app/[locale]/loading.tsx` (a `.tsx` file, it renders JSX): the `Loader` inside `<main id="main-content">`
    with a minimum height.
  - `components/skeletons/ProjectCardSkeleton/`: Server Component, styles, `index.ts`. Sizes are shared with
    `ProjectCard` through tokens or a mixin rather than copied; the media frame keeps 16:9.
  - The skeleton is a `<Suspense>` fallback in the same grid as the cards on the
    [projects page](projects-page.md); the Suspense pattern is in [caching.md](caching.md).
- **Announcements:** the fallback carries no `aria-busy`. On a slow connection the visible skeleton covers the wait,
  and the results counter (`role="status"`, projects page) announces the result when it arrives.
- **Edge cases:** a skeleton and a card differ in height when a summary or tags are long; the page keeps a minimum
  height on the results container so the footer does not jump ([projects-page.md](projects-page.md)).

## Files

- `app/src/components/ui/Loader/`: the indicator.
- `app/src/components/skeletons/ProjectCardSkeleton/`: the card placeholder (a new `skeletons` folder, see
  `conventions.md`).
- `app/src/app/[locale]/loading.tsx`: route-transition fallback.
- `app/messages/{uk,en}.json`: `Loader.label`.

## Acceptance criteria

- [ ] With network throttling the skeletons show in the grid and no layout shift is measured on the swap.
- [ ] A route transition shows the `Loader`; a screen reader announces it once.
- [ ] Under `prefers-reduced-motion` neither the `Loader` nor the shimmer animates.
- [ ] The skeletons are not in the accessibility tree.
- [ ] Renders in `en` and `uk`, light and dark, mobile and desktop.
- [ ] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`.

## Decisions

- Skeletons for the list, `Loader` for everything else: a skeleton keeps the layout, a spinner only says "wait".
- Shimmer by opacity, not a moving gradient: it follows the `transform`/`opacity` rule and has a simple
  reduced-motion fallback.
- `ProjectCardSkeleton` lives in `components/skeletons/`, not in `ui/`: it is a placeholder for one component, not a
  building block.

## Tasks

1. `Loader`, its messages and `loading.tsx`. Done when a route transition shows it.
2. `ProjectCardSkeleton` matching `ProjectCard`. Done when the sizes match at every breakpoint.
3. Browser check with throttling and `prefers-reduced-motion` (DevTools), layout shift on the swap.
4. Sync: `docs-writer` marks the spec `done` and adds the components to `ui-blocks.md`.

## Open questions

- Intended behavior of the `Loader`: on a fast connection it may not appear at all (Next shows `loading.tsx` only when
  the navigation is not instant); on a slow one it is visible. To confirm in the browser with throttling, and not
  to be treated as a guarantee until then.
- 404 status: `loading.tsx` wraps the page in Suspense, and a `notFound()` after streaming starts returns 200 (Next
  `loading.md`, status codes). The missing-`projects`-page 404 holds because the shell resolves at prerender
  ([projects-page.md](projects-page.md)); to confirm with `pnpm build` and `curl -I`.
- Settled: `loading.tsx` wraps the page and `not-found`, not the layout of its segment
  (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md`). The `[locale]` layout only
  awaits the cached `fetchSiteSettings`, so it needs no fallback of its own ([caching.md](caching.md)).
