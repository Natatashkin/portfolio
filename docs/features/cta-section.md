# CTA section

Status: draft

## Goal

A reusable call-to-action section the author places on any `page` document in Studio: text, optional background
picture and 0..n buttons, in one of three layouts. First use: the "Under NDA" block on the
[projects page](projects-page.md), which points to the work experience and the CV.

## Requirements

- [ ] Content: `eyebrow` (optional), `headline`, `description` are localized and fall back to `en` when the page
      locale is empty.
- [ ] `layout` supports `row` | `column` | `column-centered`; a missing value means `row`.
- [ ] `isFullWidth` true | false; a missing value means false.
- [ ] `hasBackground` true | false; a missing value means false. When true, `cover` is the background if it has an
      image. When false, `cover` is ignored even if it holds data.
- [ ] 0..n `buttons` (`LinkButton`); an empty list renders no button area. An empty `eyebrow` renders nothing.
- [ ] Every combination of `layout` × `hasBackground` × `isFullWidth` renders correctly.
- [ ] Internal button `url` `home` resolves to `/`, so a button can target an anchor of the home page from another
      page ([D27](../decisions.md)).
- [ ] The headline is an `h2`.
- [ ] Light and dark themes through tokens, at the breakpoints used by the other sections.
- [ ] Empty or unexpected CMS data does not throw.

## Design

- **Schema** (done, `ctaSection`):
  - Content: `eyebrow` (optional), `headline`, `description`.
  - Media: `hasBackground` (default false) and `cover` (`responsiveImage`), hidden unless `hasBackground` is true.
  - Actions: `buttons[]` of `linkButton` (optional, as in `experienceSection`).
  - Settings: `layout` select `row` | `column` | `column-centered` (default `row`), `isFullWidth` (default false),
    `anchorId`.
  - Hidden fields skip required validation (D29): `requiredInAllLanguages` and `responsiveImage.desktop` return valid
    when `context.hidden` is set, so a hidden `cover` does not block publishing. Studio keeps the hidden value, so the
    frontend decides what to render.
- **Query:** `PAGE_QUERY` in `app/src/lib/sanity/queries.ts` gets the `ctaSection` branch: text fields, `hasBackground`,
  `cover`, `layout`, `isFullWidth`, `anchorId` and `buttons[]` with the download fields, as in `experienceSection`.
  Types from TypeGen.
- **UI:**
  - `CtaSection` in `components/sections/` with its `SectionRenderer` case; Server Component, reusable on any page.
  - `LinkButton` resolves an internal `url` of `home` to `/`.
  - Look follows `layout`, `hasBackground` and `isFullWidth`; colours, fonts and spacing come from the existing tokens.
- **Edge cases:** no buttons; no eyebrow; `hasBackground` true without a `cover` image (see Open questions); `cover`
  filled while `hasBackground` is false; missing `layout`, `hasBackground` or `isFullWidth` in older content; a broken
  download reference (no button, as in `LinkButton`).

## Files

- `sanity-cms/schemaTypes/sections/ctaSection.ts`, `blocks/responsiveImage.ts` and `lib/localized.ts` (hidden-field
  validation).
- `app/src/lib/sanity/queries.ts`, `app/src/sanity.types.ts`.
- `app/src/components/sections/CtaSection/`, `SectionRenderer`.
- `app/src/components/ui/LinkButton/` (`home` path).
- Docs: `specs/content-model.md`, `decisions.md` (D27, D28, D29), `features/ui-blocks.md`.

## Acceptance criteria

- [ ] Every combination of `layout` × `hasBackground` × `isFullWidth` renders in light and dark at 1400, 1040, 800,
      700 and 390 px.
- [ ] Missing values render as `row`, no background, not full width.
- [ ] `cover` is not shown when `hasBackground` is false.
- [ ] Empty `buttons`, `eyebrow` or `cover` do not throw.
- [ ] A `home` button with an anchor lands on that section of the home page in the current locale; a download button
      serves the file of the current locale.
- [ ] Existing `LinkButton` behavior is unchanged.
- [ ] Keyboard order and visible focus through the buttons.
- [ ] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`; Studio builds.

## Decisions

- `buttons[]` instead of one `button`, `layout` as a select, `hasBackground` next to an optional `cover`
  ([D28](../decisions.md)).
- Hidden fields skip required validation, so a hidden `cover` never blocks publishing ([D29](../decisions.md)).
- `home` means `/` ([D27](../decisions.md)).

## Tasks

1. Schema: done.
2. Query branch and TypeGen. Done when a `ctaSection` on a `page` document returns every field in both locales.
3. `CtaSection` with all variants, `SectionRenderer` case, `home` path in `LinkButton`. Done when every variant
   renders and existing buttons are unchanged.
4. Browser check of all variants in light and dark at the breakpoints.
5. Sync: `docs-writer` updates the specs to the code. Done when the author marks the feature `done`.

## Open questions

- What renders when `hasBackground` is true but `cover` has no image? Proposal: the no-background variant, no error.
