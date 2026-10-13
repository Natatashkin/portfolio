# Hero section

Status: done (documented after implementation)

## Goal

The first screen: who the author is, a headline, a short description, a call to action, the main stack, a portrait
with a quote and key metrics. Also the reference implementation for every other section.

## Requirements

- [x] Role, full name as the page `h1`, headline with the `accent` highlight and a shine effect, rich-text description.
- [x] CTA from `ctaButton` (`LinkButton`).
- [x] Stack list from references to `technology` (shows `name`) or `skill` (shows `title`); items without a label are
      skipped.
- [x] Portrait from `responsiveImage` (separate mobile crop, falls back to desktop), loaded with `priority`; quote as
      the figure caption. The desktop asset gates the whole figure: without it neither the image nor the quote renders.
- [x] Metrics (from `metric` references): the value fades in once half of it is on screen (one-shot), staggered by
      index (80 ms steps); the label is plain text. Metrics live in the hero; there is no separate metrics section.
- [x] Decorative dot grid lit around the cursor, shown from `lg` only.
- [x] Every field is optional at render time: a missing field renders nothing.

## Design

- **Schema:** `heroSection` ([../specs/content-model.md](../specs/content-model.md)). `role` is a plain string;
  `fullname`, `headline`, `description`, `quote` and the image `alt` are localized.
- **Query:** `heroSection` branch of `PAGE_QUERY` projects `anchorId`, `role`, `fullname`, `headline`, `description`,
  `quote`, `stack` (`technology` → `name`, `iconKey`; `skill` → `title`, `iconKey`), `image` (`desktop`, `mobile`,
  `alt`), `ctaButton` (all `linkButton` fields) and `metrics` (`value`, `label`), each localized field with the `en`
  fallback. Dangling references are filtered (`defined(@->_id)`). Cache tags: `page`, `technology`, `skill`, `metric`.
- **UI:** `HeroSection` is a Server Component typed with `SectionOf<'heroSection'>`. Client children:
  - `HeroGrid`: follows the pointer with eased `requestAnimationFrame` updates of CSS variables; runs only for
    `(hover: hover) and (pointer: fine)` without reduced motion, pauses off screen (`IntersectionObserver`).
  - `HeroMetricNumber`: server HTML is fully visible; after hydration it is hidden and revealed with an opacity and
    transform transition when in view (`useInView`, `useIsMounted`). With reduced motion it stays visible.
- **Image sizes:** `sizes` mirrors the `.hero__picture` widths (50vw / 44vw / 33vw, max 400px); `next.config.ts`
  `deviceSizes` include 400 and 800 for 1x and 2x.

## Files

- `app/src/components/sections/HeroSection/`: `HeroSection`, `HeroGrid`, `HeroMetricNumber` and their modules.
- `app/src/lib/sanity/queries.ts`: `heroSection` branch and `PAGE_QUERY_TAGS`.
- `app/src/hooks/useInView.ts`, `app/src/hooks/useIsMounted.ts`.

## Acceptance criteria

- [x] Works in `en` and `uk`, light and dark, mobile and desktop.
- [x] Empty or missing fields and dangling references do not throw.
- [x] With reduced motion: metrics are visible without the fade, and the grid keeps its static spot (no
      pointer-driven motion). No pointer tracking on touch devices.
- [x] Content is in the server HTML (crawlers and no-JS visitors see metrics).

## Open questions

- Stack items render text only: `iconKey` is projected but no icon map exists yet.

## Decisions

- `role` is a plain, non-localized string: the role title is not translated. `siteSettings.role` was removed.
- The separate `metricsSection` was removed from the schema; metrics live only in the hero.
