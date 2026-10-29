# Career section

Status: in progress (static layout done; scroll reveal and pulsing dot pending)

## Goal

Show the author's career path ("My way"): an intro with a CV download and a short list of steps laid over a road photo,
ending with a tagline. The section also makes the hero's dot grid a shared component.

## Requirements

- [x] Renders `eyebrow`, `headline` (`Headline`, accent on the highlighted part), rich-text `description`, `buttons`
      (`LinkButton`, may be a CV download, D15), `steps`, `tagline` and `cover`. Every field is optional: a missing
      field renders nothing, never an empty wrapper.
- [x] `steps` are `road` references; each card shows `period` (accent colour), `title` and `description`. Steps keep
      the order of the references. No steps: no list.
- [ ] `cover` is the road photo. Without a desktop asset no image renders and the steps fall back to the plain list
      (no cards overlay); the text column and the tagline still render.
- [x] Desktop (`lg` up): two columns. Left: eyebrow, headline, description, buttons. Right: the cover with the step
      cards overlaid, the tagline below it.
- [x] Desktop cards rise diagonally from left to right (each next card higher). Each card has an accent dot with a dashed
      vertical line pointing down to the road. Positions are CSS by index (`:nth-child` offsets), designed for up to
      four steps.
- [x] Mobile: the cover (mobile crop, falls back to desktop) is a full-bleed background of the whole section. On top:
      eyebrow with a short accent rule, headline, description, buttons, then the cards stacked in a zigzag over the
      road, each with a dot and a thin vertical line to the road; the tagline at the bottom.
- [x] Tagline is italic Montserrat with an accent underline stroke.
- [x] The dot grid (`DotGrid`) shows in the lower middle of the section from `lg` up only.
- [ ] The last step's dot pulses (CSS animation of `transform` and `opacity` only).
- [ ] Text and cards appear gradually on scroll: staggered fade and translate, once, on `transform` and `opacity`
      only, through the `useInView` pattern.
- [ ] Without JS and with `prefers-reduced-motion`, everything is visible and static: the server HTML is fully visible,
      the hidden state is applied only after hydration and only for `no-preference`; the pulse is off under reduced
      motion.
- [x] `HeroGrid` becomes the shared `DotGrid` in `components/ui/DotGrid`; the hero uses it with unchanged behaviour
      and the `HERO_GRID_*` constants become `DOT_GRID_*`.
- [ ] Non-functional: steps are an ordered list (`ol`/`li`); dots and lines are decorative (`aria-hidden`, no text);
      text keeps readable contrast over the photo in both themes (dark theme not checked); no interface strings, so
      nothing is added to `messages/`.

## Design

- **Schema:** exists, no change: `careerSection` and `road` in [../specs/content-model.md](../specs/content-model.md).
  `eyebrow`, `headline`, `description`, `tagline`, `road.period`, `road.title`, `road.description` and the cover `alt`
  are localized; `road.period` and `road.title` are required in Studio, `road.description` is optional.
- **Query:** a `careerSection` branch in `PAGE_QUERY` projects `eyebrow`, `headline`, `description`, `tagline`,
  `steps` (`steps[defined(@->_id)]->{ _id, period, title, description }`, each with the literal `en` fallback),
  `cover{ desktop, mobile, alt }` as in the hero image, and `buttons[]` with every `linkButton` field plus the resolved
  `fileUrl` and `fileName` for `linkType == "download"` (D15). `anchorId` is already projected for all sections.
  `PAGE_QUERY_TAGS` gains `road`; TypeGen is regenerated.
- **UI:**
  - `CareerSection` (`components/sections/CareerSection/`) is a Server Component typed with
    `SectionOf<'careerSection'>`, registered in `SectionRenderer`. Root `<section id={anchorId ?? undefined}>` in
    `Container`; text parts reuse `Headline`, `RichText`, `LinkButton`, `ResponsiveImage`.
  - Pending (reveal block): a client child only for the reveal: one private reveal child in the section folder, built like `HeroMetricNumber`
    (`useInView` and `useIsMounted`; hidden only after mount and only under `prefers-reduced-motion: no-preference`).
    The plain `InView` is not used: it always renders `data-in-view="false"` in the server HTML, so CSS hiding on that
    value would hide the content without JS. One sequence driven by the section: the text group first, then the
    cards, staggered by an `--index` custom property and `transition-delay`. The section itself stays a Server
    Component.
  - `DotGrid` is a client leaf (pointer-lit dot grid, moved from `HeroSection/HeroGrid`); the hero and the career
    section pass it a `className` for placement. In the career section it is hidden below `lg`.
  - Cards: `CareerSteps` (private child in its own folder `CareerSection/CareerSteps/`, with its own module and
    `index.ts`), rendered twice with a `variant` prop: `mobile` sits in `career__container` between the text and the
    tagline (a column of cards, zigzag from `docs/layouts/my-way-mob.png`); `desktop` sits over the cover inside the
    media wrapper (absolute cards, diagonal by `:nth-child`). `career__media` and `career__mediaWrapper` are
    `display: contents` below `lg`, so the picture fills the section and the tagline joins the container column.
    `CareerSteps` is a small client leaf: it reads the `lg` breakpoint with `useIsMobile` (`useSyncExternalStore` on
    `MOBILE_QUERY`, server snapshot `null`) and, after hydration, returns `null` for the variant that does not match,
    also after a resize, so only one list (and no repeated ids) is in the DOM. The server HTML has both (the viewport
    is unknown there) and CSS hides one, so the content is visible without JS. The cost is that until hydration the
    step markup is in the HTML twice and the step data is serialised twice in the RSC payload; four short steps make
    that acceptable, and `display: none` keeps the hidden copy out of the accessibility tree. The mobile cards follow
    the DOM order top to bottom (no `column-reverse`, so tab order matches) and are placed by `--step-offset` from the
    container centre (the `md` breakpoint has other offsets), so the zigzag stays on the road at any width below `lg`.
    The pulsing dot on the last card (`:last-child`) is pending.
  - Overlay mode: `CareerSection` passes `isOverlay` when there are at most `MAX_OVERLAY_STEPS` (4) steps. The list is
    a plain list by default; the `--overlay` modifier turns it into cards, and the dot markers exist only there. With
    more steps both variants render a plain list, so cards never leave the photo.
  - Tokens: colours, spacing and radii from `_tokens.scss` only; accent via `var(--color-accent)`.
- **Image sizes:** desktop `sizes` mirrors the width of the right column (about half of the container); mobile is
  `100vw`. Exact values are set with the SCSS and checked against `next.config.ts` `deviceSizes`. The cover is not
  `priority` (below the fold).
- **Edge cases:**
  - A step without `period` or `title` still renders what it has; a card with no text at all is skipped.
  - Dangling `steps` references are filtered in GROQ.
  - Empty `uk` value falls back to `en` in GROQ (D3); untranslated content is not an error.
  - A download button without a usable `https` file URL renders nothing (`LinkButton`); the rest of the section is
    unaffected.
  - Long text wraps; cards do not overlap the text column on desktop.

## Files

- `app/src/components/sections/CareerSection/`: `CareerSection`, module, `index.ts`.
- `app/src/components/sections/CareerSection/CareerSteps/`: private client child (`CareerSteps`, module, `index.ts`).
- `app/src/hooks/useIsMobile.ts`: `matchMedia` subscription on `MOBILE_QUERY`, `null` on the server.
- `app/src/components/ui/DotGrid/`: `DotGrid`, module, `index.ts` (moved and renamed from `HeroSection/HeroGrid.tsx` and `HeroGrid.module.scss`; `index.ts` is new).
- `app/src/components/sections/HeroSection/HeroSection.tsx`: imports `DotGrid`.
- `app/src/components/sections/SectionRenderer/SectionRenderer.tsx`: `careerSection` case.
- `app/src/lib/sanity/queries.ts`: `careerSection` branch and `PAGE_QUERY_TAGS`.
- `app/src/lib/constants.ts`: `DOT_GRID_*` (renamed from `HERO_GRID_*`), `MOBILE_QUERY`.
- `app/src/components/ui/ResponsiveImage/ResponsiveImage.tsx`: `<source media>` uses `MOBILE_QUERY`.
- `app/src/styles/_tokens.scss`: `--marker-size` (dot size, reusable).
- `app/src/sanity.types.ts`: regenerated.

## Acceptance criteria

- [ ] Renders in `en` and `uk`, light and dark, mobile and desktop.
- [ ] Empty or unexpected CMS data (no steps, no cover, no buttons, a one-step list, five steps) does not throw.
- [ ] The cards never leave the cover on desktop with four steps.
- [ ] With JS disabled and with reduced motion the text and cards are visible; the pulse does not run under reduced
      motion.
- [ ] The grid does not show below `lg`; the hero grid behaves as before after the move.
- [ ] Content is in the server HTML.
- [ ] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`; Studio builds.

## Decisions

- `HeroGrid` moves to `components/ui/DotGrid` and the constants become `DOT_GRID_*`: a second component needs it, and
  [../conventions.md](../conventions.md#components) says a private child moves to `components/ui/` then. Recorded in
  [../decisions.md](../decisions.md) as D16.
- Card positions are CSS by index, not data: the layout is designed for four steps and the author controls the count.
- `CareerSteps` is a private child in its own folder, and its two variants are rendered conditionally after
  hydration: the author wanted no repeated ids and one list in the DOM; the cost is the duplicate markup until
  hydration. Recorded in [../decisions.md](../decisions.md) as D17.
- One mobile breakpoint value in TypeScript, `MOBILE_QUERY = '(max-width: 1023px)'` (mirrors `lg`); `MOBILE_MAX_WIDTH`
  is removed.
- Reveal is CSS-driven through the existing `useInView` pattern, not GSAP: the effect is a one-shot fade, and the
  server HTML stays visible (see [../specs/theming-and-motion.md](../specs/theming-and-motion.md)).

## Tasks

Done in the code: the `DotGrid` extraction, the query branch, and the static layout (desktop and mobile).

Pending:

1. Scroll reveal and the pulsing dot on the last card, reduced-motion handling.
2. Final sync of the spec, `features/README.md` and `roadmap.md`.

## Open questions

- Text contrast over the full-bleed mobile photo: a gradient from tokens is in place; the amount is decided with the
  real photo. Not checked: `uk`, dark theme, five real steps, `pnpm build`, no-JS.

## Resolved

- Tagline: italic Montserrat plus an accent underline stroke (`text-decoration` or a pseudo-element); no second font.
- Buttons: all `buttons[]` render in a row; the author adds two (one CV per language version, D15).
- More than four steps, or no cover: plain list, no overlay (`isOverlay = hasCover && steps <= MAX_OVERLAY_STEPS`).
- Minimum height: the section has none; its height comes from the content (the old `100dvh` requirement and the
  `150dvh` below `lg` are dropped).
- `useIsMobile` stays in `hooks/`: more components will use it.
- The eyebrow accent rule applies at every breakpoint.
- Reveal: one sequence driven by the section (text, then cards), threshold below 0.5 because the section is taller
  than the viewport.
