# Loading states

Status: done

## Goal

The visitor sees that something is loading and the page does not jump when it arrives: a `ProjectCardSkeleton`
holds the place of a project card while the list streams in.

## Requirements

- [x] `ProjectCardSkeleton` mirrors the `ProjectCard` layout: 16:9 media, a title row, summary lines and a tag row,
      with the same box, padding and gaps, so swapping it for a card causes no layout shift.
- [x] `ProjectCardSkeleton` is `aria-hidden` and has no text; it animates opacity only (a shimmer) and is static under
      `prefers-reduced-motion`.
- [x] Colours come from tokens (the muted text colour at low strength).
- [x] Skeletons render no interactive elements.
- [x] There is no shared `[locale]/loading.tsx` and no generic loader (see Decisions).

## Design

- **Schema / Query:** none.
- **UI:**
  - `components/ui/ProjectCard/ProjectCardSkeleton/`: Server Component, styles, `index.ts`. It uses the classes of
    `ProjectCard.module.scss` for the box, the 16:9 frame, the summary height and the tag block, so no size is copied;
    its own module holds only the bones and the shimmer.
  - The skeleton is a `<Suspense>` fallback in the same grid as the cards on the
    [projects page](projects-page.md); the Suspense pattern is in [caching.md](caching.md).
- **Announcements:** the fallback carries no `aria-busy`. On a slow connection the visible skeleton covers the wait,
  and the results counter (`role="status"`, projects page) announces the result when it arrives.
- **Edge cases:** a skeleton and a card differ in height when a summary or tags are long; the results area is never
  shorter than one invisible skeleton row, so the footer does not jump ([projects-page.md](projects-page.md)).

## Files

- `app/src/components/ui/ProjectCard/ProjectCardSkeleton/`: the card placeholder (see `conventions.md`).

## Acceptance criteria

- [x] With network throttling the skeletons show in the grid and no layout shift is measured on the swap.
- [x] Under `prefers-reduced-motion` the shimmer does not animate.
- [x] The skeletons are not in the accessibility tree.
- [x] Renders in `en` and `uk`, light and dark, mobile and desktop (the skeleton has no text, so the locale does not
      change it).
- [x] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`.

## Decisions

- Shimmer by opacity, not a moving gradient: it follows the `transform`/`opacity` rule and has a simple
  reduced-motion fallback.
- `ProjectCardSkeleton` lives in the `ProjectCard` folder and reuses the card's CSS Module: it mirrors one component,
  so it sits with it, and sharing the module (not mixins) keeps the sizes in one place without adding CSS.
- No shared `[locale]/loading.tsx` and no generic loader: [D33](../decisions.md). Loading is local to the one list
  that streams.

## Tasks

Done in the code.

## Open questions

- Not checked: the skeleton in light and dark and in both locales (heights were measured at desktop and tablet
  widths only). The spec turns `done` after that check.
