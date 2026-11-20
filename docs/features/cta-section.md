# CTA section

Status: done

## Goal

A reusable call-to-action section the author places on any `page` document in Studio: text, optional background
picture, an optional main CTA button and 0..n additional buttons, in one of two layouts. First use: the "Under NDA" block on the
[projects page](projects-page.md), which points to the work experience and the CV.

Design variants ([mockups](https://claude.ai/artifact/G4YBQTBueE8YYXmVXKP5Ex)): a card; a card without an eyebrow; a card with fewer buttons; full width; full width with a
picture; centered.

## Requirements

- [x] Content: `eyebrow` (optional), `headline`, `description` are localized and fall back to `en` when the page
      locale is empty.
- [x] `layout` supports `row` | `column-centered`; a missing value means `row`.
- [x] `isFullWidth` true | false; a missing value means false.
- [x] `hasBackground` true | false; a missing value means false. When true and `cover` has an image, the cover is the
      background, both inside the card and in the full-width variant; a dark overlay over the picture keeps the text
      readable. When true without a cover image, the no-background variant renders (no error). When false, `cover` is
      ignored even if it holds data.
- [x] In the `column-centered` layout the text and buttons are centered, but the eyebrow stays left-aligned with the
      accent bar under it.
- [x] An optional `ctaButton` (the main action) and 0..n additional `buttons` (`LinkButton`). In `row` the CTA button
      sits on the right and the additional buttons under the description; in `column-centered` all buttons form one
      centered row, additional buttons first, the CTA button last. Below `lg` the `row` layout stacks and the CTA button
      follows the additional buttons. No button renders no button area. An empty `eyebrow` renders nothing.
- [x] Every combination of `layout` × `hasBackground` × `isFullWidth` renders correctly.
- [x] Internal button `url` `home` resolves to `/`, so a button can target an anchor of the home page from another
      page (see Decisions).
- [x] The headline is an `h2`.
- [x] Light and dark themes through tokens, at the breakpoints used by the other sections.
- [x] Empty or unexpected CMS data does not throw.

## Design

- **Schema** (`ctaSection`):
  - Content: `eyebrow` (optional), `headline`, `description`.
  - Media: `hasBackground` (default false) and `cover` (`responsiveImage`), hidden unless `hasBackground` is true.
  - Actions: `ctaButton` (`linkButton`, optional, title "CTA button", as in `heroSection`) and `buttons[]` of
    `linkButton` (optional, title "Additional buttons").
  - Settings: `layout` select `row` | `column-centered` (default `row`), `isFullWidth` (default false),
    `anchorId`.
  - Hidden fields skip required validation (see Decisions): `requiredInAllLanguages` and `responsiveImage.desktop` return valid
    when `context.hidden` is set, so a hidden `cover` does not block publishing. Studio keeps the hidden value, so the
    frontend decides what to render.
- **Query:** `PAGE_QUERY` in `app/src/lib/sanity/queries.ts` gets the `ctaSection` branch: text fields, `hasBackground`,
  `cover`, `layout`, `isFullWidth`, `anchorId`, and `ctaButton` and `buttons[]`, both with the download fields, as in
  `experienceSection`.
  Types from TypeGen.
- **UI:**
  - `CtaSection` in `components/sections/` with its `SectionRenderer` case; Server Component, reusable on any page.
  - `LinkButton` resolves an internal `url` of `home` to `/`.
  - Look follows `layout`, `hasBackground` and `isFullWidth` as modifiers (`row` | `centered`, card | `full`, `bg`),
    eight combinations; the background is applied only when `hasBackground` is true and `cover.desktop` exists, with
    `ResponsiveImage` and a dark scrim (`--color-photo-scrim`). Colours, fonts and spacing come from the existing
    tokens; over a photo the block overrides the colour tokens locally (`--color-on-photo` for text and borders,
    the scrim colour for text on filled buttons), because a photo stays dark in both themes. The headline is
    `--font-h2` at weight 400.
- **Edge cases:** no headline, description or button: the section renders nothing; no buttons; only the CTA button (mockup 3); only additional buttons; no eyebrow; `hasBackground` true without a `cover` image (renders without background);
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

- [x] Every combination of `layout` × `hasBackground` × `isFullWidth` renders in light and dark at 1400, 1040, 800,
      700 and 390 px.
- [x] Missing values render as `row`, no background, not full width.
- [x] `cover` is not shown when `hasBackground` is false; `hasBackground` without a cover image renders the
      no-background variant.
- [x] The six mockup variants are reproducible with the fields.
- [x] Empty `buttons`, `eyebrow` or `cover` do not throw.
- [x] A `home` button with an anchor lands on that section of the home page in the current locale; a download button
      serves the file of its own language (`download.language`) whatever the site locale, as in the Experience section
      ([ui-blocks.md](ui-blocks.md), Decisions).
- [x] Existing `LinkButton` behavior is unchanged.
- [x] Keyboard order and visible focus through the buttons.
- [x] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`; Studio builds.

## Decisions

- One `ctaButton` plus `buttons[]` instead of a single list: the mockups place the main action apart from the
  secondary ones, and a separate field states which is which instead of guessing from the order or the `linkType`.
  The array keeps its name `buttons` (only its title is "Additional buttons"), so content already entered survives.
  The unused `tagline` is removed. The block is reusable on any `page` document.
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
- Over a photo the block redefines the colour tokens on itself instead of adding photo-only classes: every child
  (headline, buttons, eyebrow bar) keeps its normal rules and reads light on the dark scrim in both themes.
- `hasBackground` without a cover renders the no-background variant: the toggle alone is not an error the visitor
  should see.

## Tasks

Done in the code.

## Open questions

- None.
