# Loading states

Status: approved

## Goal

The visitor sees that something is loading and the page does not jump when it arrives: a `ProjectCardSkeleton`
holds the place of a project card while the list streams in.

## Requirements

- [ ] `ProjectCardSkeleton` mirrors the `ProjectCard` layout: 16:9 media, a title row, summary lines and a tag row,
      with the same box, padding and gaps, so swapping it for a card causes no layout shift.
- [ ] `ProjectCardSkeleton` is `aria-hidden` and has no text; it animates opacity only (a shimmer) and is static under
      `prefers-reduced-motion`.
- [ ] Colours come from tokens and work in light and dark themes.
- [ ] Skeletons render no interactive elements.

## Design

- **Schema / Query:** none.
- **UI:**
  - `components/skeletons/ProjectCardSkeleton/`: Server Component, styles, `index.ts`. Sizes are shared with
    `ProjectCard` through tokens or a mixin rather than copied; the media frame keeps 16:9.
  - The skeleton is a `<Suspense>` fallback in the same grid as the cards on the
    [projects page](projects-page.md); the Suspense pattern is in [caching.md](caching.md).
- **Announcements:** the fallback carries no `aria-busy`. On a slow connection the visible skeleton covers the wait,
  and the results counter (`role="status"`, projects page) announces the result when it arrives.
- **Edge cases:** a skeleton and a card differ in height when a summary or tags are long; the page keeps a minimum
  height on the results container so the footer does not jump ([projects-page.md](projects-page.md)).

## Files

- `app/src/components/skeletons/ProjectCardSkeleton/`: the card placeholder (a new `skeletons` folder, see
  `conventions.md`).

## Acceptance criteria

- [ ] With network throttling the skeletons show in the grid and no layout shift is measured on the swap.
- [ ] Under `prefers-reduced-motion` the shimmer does not animate.
- [ ] The skeletons are not in the accessibility tree.
- [ ] Renders in `en` and `uk`, light and dark, mobile and desktop.
- [ ] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`.

## Decisions

- Shimmer by opacity, not a moving gradient: it follows the `transform`/`opacity` rule and has a simple
  reduced-motion fallback.
- `ProjectCardSkeleton` lives in `components/skeletons/`, not in `ui/`: it is a placeholder for one component, not a
  building block.

## Tasks

1. `ProjectCardSkeleton` matching `ProjectCard`. Done when the sizes match at every breakpoint.
2. Browser check with throttling and `prefers-reduced-motion` (DevTools), layout shift on the swap.
3. Sync: `docs-writer` marks the spec `done` and adds the component to `ui-blocks.md`.

## Open questions

- None.
