# CTA section

Status: approved

## Goal

A reusable call-to-action section the author places on any `page` document in Studio: text, optional background
picture and 0..n buttons, in one of two layouts. First use: the "Under NDA" block on the
[projects page](projects-page.md), which points to the work experience and the CV.

Design variants: a card; a card without an eyebrow; a card with fewer buttons; full width; full width with a
picture; centered.

## Requirements

- [ ] Content: `eyebrow` (optional), `headline`, `description` are localized and fall back to `en` when the page
      locale is empty.
- [ ] `layout` supports `row` | `column-centered`; a missing value means `row`.
- [ ] `isFullWidth` true | false; a missing value means false.
- [ ] `hasBackground` true | false; a missing value means false. When true and `cover` has an image, the cover is the
      background, both inside the card and in the full-width variant; a dark overlay over the picture keeps the text
      readable. When true without a cover image, the no-background variant renders (no error). When false, `cover` is
      ignored even if it holds data.
- [ ] In the `column-centered` layout the text and buttons are centered, but the eyebrow stays left-aligned with the
      accent bar under it.
- [ ] 0..n `buttons` (`LinkButton`); an empty list renders no button area. An empty `eyebrow` renders nothing.
- [ ] Every combination of `layout` × `hasBackground` × `isFullWidth` renders correctly.
- [ ] Internal button `url` `home` resolves to `/`, so a button can target an anchor of the home page from another
      page (see Decisions).
- [ ] The headline is an `h2`.
- [ ] Light and dark themes through tokens, at the breakpoints used by the other sections.
- [ ] Empty or unexpected CMS data does not throw.

## Design

- **Schema** (done, `ctaSection`):
  - Content: `eyebrow` (optional), `headline`, `description`.
  - Media: `hasBackground` (default false) and `cover` (`responsiveImage`), hidden unless `hasBackground` is true.
  - Actions: `buttons[]` of `linkButton` (optional, as in `experienceSection`).
  - Settings: `layout` select `row` | `column-centered` (default `row`), `isFullWidth` (default false),
    `anchorId`.
  - Hidden fields skip required validation (see Decisions): `requiredInAllLanguages` and `responsiveImage.desktop` return valid
    when `context.hidden` is set, so a hidden `cover` does not block publishing. Studio keeps the hidden value, so the
    frontend decides what to render.
- **Query:** `PAGE_QUERY` in `app/src/lib/sanity/queries.ts` gets the `ctaSection` branch: text fields, `hasBackground`,
  `cover`, `layout`, `isFullWidth`, `anchorId` and `buttons[]` with the download fields, as in `experienceSection`.
  Types from TypeGen.
- **UI:**
  - `CtaSection` in `components/sections/` with its `SectionRenderer` case; Server Component, reusable on any page.
  - `LinkButton` resolves an internal `url` of `home` to `/`.
  - Look follows `layout`, `hasBackground` and `isFullWidth` as modifiers (`row` | `centered`, card | `full`, `bg`),
    eight combinations; the background is applied only when `hasBackground` is true and `cover.desktop` exists, with
    `ResponsiveImage` and a dark overlay. Colours, fonts and spacing come from the existing tokens.
- **Edge cases:** no buttons; no eyebrow; `hasBackground` true without a `cover` image (renders without background);
  `cover` filled while `hasBackground` is false; missing `layout`, `hasBackground` or `isFullWidth` in older content; a broken
  download reference (no button, as in `LinkButton`).

## Files

- `sanity-cms/schemaTypes/sections/ctaSection.ts`, `blocks/responsiveImage.ts` and `lib/localized.ts` (hidden-field
  validation).
- `app/src/lib/sanity/queries.ts`, `app/src/sanity.types.ts`.
- `app/src/components/sections/CtaSection/`, `SectionRenderer`.
- `app/src/components/ui/LinkButton/` (`home` path).
- Docs: `specs/content-model.md`, `features/ui-blocks.md`.

## Acceptance criteria

- [ ] Every combination of `layout` × `hasBackground` × `isFullWidth` renders in light and dark at 1400, 1040, 800,
      700 and 390 px.
- [ ] Missing values render as `row`, no background, not full width.
- [ ] `cover` is not shown when `hasBackground` is false; `hasBackground` without a cover image renders the
      no-background variant.
- [ ] The six mockup variants are reproducible with the fields.
- [ ] Empty `buttons`, `eyebrow` or `cover` do not throw.
- [ ] A `home` button with an anchor lands on that section of the home page in the current locale; a download button
      serves the file of the current locale.
- [ ] Existing `LinkButton` behavior is unchanged.
- [ ] Keyboard order and visible focus through the buttons.
- [ ] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`; Studio builds.

## Decisions

- `buttons[]` instead of one `button`: same shape as `experienceSection`, so one block can carry two actions ("Work
  experience", "Download CV"); the unused `tagline` is removed. The block is reusable on any `page` document.
- `layout` is a select, since a few options fit a dropdown and the section settings stay compact. `hasBackground` sits
  in Media next to `cover`, which is optional and shown only when it is on, so a CTA without a picture needs no image.
  `eyebrow` and `buttons[]` are optional, so a CTA can be text only.
- Hidden fields skip required validation: Sanity validates hidden fields too, so a hidden `cover` would block
  publishing. `requiredInAllLanguages` and `responsiveImage.desktop` return valid when `context.hidden` is set (the
  field or an ancestor is hidden); it applies to every hidden field that uses these rules. The value is kept, so the
  frontend decides what to render (`cover` only when `hasBackground` is true).
- Internal `linkButton` path `home` means `/`: Studio cannot store an empty path and `home` is already the home page
  slug, so a button on another page can target a home anchor.
- Layout is `row | column-centered` only: a plain stacked `column` was dropped as unnecessary; the design needs a
  centered layout, not merely a stacked one.
- `hasBackground` without a cover renders the no-background variant: the toggle alone is not an error the visitor
  should see.

## Tasks

1. Schema: done.
2. Query branch and TypeGen. Done when a `ctaSection` on a `page` document returns every field in both locales.
3. `CtaSection` with all variants, `SectionRenderer` case, `home` path in `LinkButton`. Done when every variant
   renders and existing buttons are unchanged.
4. Browser check of all variants in light and dark at the breakpoints.
5. Sync: `docs-writer` updates the specs to the code. Done when the author marks the feature `done`.

## Open questions

- `app/src/sanity.types.ts` is stale for `ctaSection` (still `button` and `tagline`); regenerated by `pnpm typegen`
  in the schema block of the [projects page](projects-page.md).
