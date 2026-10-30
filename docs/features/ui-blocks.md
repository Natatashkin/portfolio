# UI blocks

Status: done (documented after implementation)

## Goal

Small shared building blocks for sections and the header, so a section composes buttons, headlines, rich text, images
and layout width from one place and every CMS-provided link, text and image is read safely. Logo, Navigation and
SocialLinks are in [header.md](header.md) and [footer.md](footer.md); the theme and language switchers have their own
specs ([theme-switcher.md](theme-switcher.md), [language-switcher.md](language-switcher.md)). Block fields:
[../specs/content-model.md](../specs/content-model.md#blocks-object-types); rules:
[../conventions.md](../conventions.md).

## Requirements

### LinkButton (server)

- [x] Props are built from the Studio schema type `LinkButton` (TypeGen) and not from any section: `linkType`, `url`,
      `hasAnchor`, `anchor`, `variant`, `hasIcon` (each may be `null`, as GROQ returns empty fields), plus `label`
      (the localized string resolved in GROQ), `fileUrl` and `fileName` (`LinkButton/types.ts`).
- [x] Renders nothing without `label` or `url`, or when the link does not pass the safety check.
- [x] `linkType: external`: `url` goes through `safeHref`; the `<a>` gets `target="_blank"` and
      `rel="noopener noreferrer"`.
- [x] Any other `linkType` is treated as internal: `url` goes through `safePath`, the result is rendered with the
      locale-aware `Link` from `@/i18n/navigation`. `#anchor` is appended only when `hasAnchor` is set and `anchor`
      matches `^[a-z]+(?:-[a-z]+)*$` (the Studio regex, copied by hand); otherwise it is dropped.
- [x] External links carry a visually hidden "(opens in a new tab)" after the content, from `messages/{en,uk}.json`
      (`LinkButton.opensInNewTab`); the string is the same as in `SocialLinks`.
- [ ] `linkType: download`: renders `<a href download>` with the PDF URL of `download.document` in `download.language`,
      after `safeHref`, with `?dl=<originalFilename>` (fallback `document.pdf`, `DEFAULT_DOWNLOAD_FILENAME`) appended; no `target="_blank"`. Renders nothing when there is no file or
      the URL is unsafe. Props gain `fileUrl` and `fileName` (resolved in GROQ, D15).
- [ ] A download link carries a visually hidden "(download file)" after the content, from `messages/{en,uk}.json`
      (`LinkButton.download`).
- [x] `variant` is `primary` (default when empty or unknown), `secondary` or `accent`; classes `button--<variant>`.
- [x] `hasIcon` appends an icon after the label: `DownloadIcon` for a download button, `ArrowIcon` for the others; the icon is `aria-hidden` with `focusable="false"`.
- [x] Styles: tokens only (`--color-*`, `--space-*`, `--radius-pill`, `--font-base`), `focus-visible` uses the
      `focus-ring` mixin, hover is `opacity: 0.85` only inside `@media (hover: hover)`, and the transition is removed
      under `prefers-reduced-motion: reduce`.

### Button (server, no state of its own)

- [x] Props: native `<button>` props plus `label: ReactNode` and `variant` (`primary` default, `secondary`, `accent`,
      `transparent`); `className` is merged with `clsx`; `type` defaults to `button`.
- [x] `children` are rendered after the label (meant for an icon).
- [x] Disabled: `opacity: 0.5`, `cursor: not-allowed`, no hover effect.
- [x] Hover (`filter: brightness(0.92)`) only inside `@media (hover: hover)`; the transition is removed under
      `prefers-reduced-motion: reduce`; `focus-visible` uses the `focus-ring` mixin.
- [x] No CMS data reaches it. Its only user is `ThemeSwitcher`; it is not a CMS "button" block (see
      [../conventions.md](../conventions.md) and the out-of-scope rule on a plain `button` block).

### Headline (server; `InView` only with `shine`)

- [x] Props: `value` (TypeGen `Headline`, Portable Text), `as` (default `h2`), `shine`, `className`.
- [x] Renders through `@portabletext/react`: the normal block is unwrapped (no `<p>` inside the heading) and the
      `accent` mark becomes `<span class="headline__accent">` in `--color-accent-ink`.
- [x] No `dangerouslySetInnerHTML`; text goes through React.
- [x] With `shine` the heading is wrapped in `InView` (the heading element is the `InView` element). The light sweep is
      a CSS animation of `background-position` on the accent text, started by `[data-in-view='true']`.
- [x] The sweep runs only under `prefers-reduced-motion: no-preference` and `forced-colors: none`; in forced colors
      the gradient is dropped and the text keeps `currentcolor`.
- [x] Without `shine` there is no client code on the headline.

### RichText (server)

- [x] Props: `value` (TypeGen `RichText`), `className`. Renders a `<div class="richText">` around `PortableText`.
- [x] Normal block is a `<p>`, bullet list a `<ul>`; paragraphs get spacing through the `& + &` rule.
- [x] The `link` mark renders `<a>` only when `safeHref(value?.href)` passes (`rel="noopener noreferrer"`, no
      `target`); otherwise the link text is rendered as plain text.
- [x] No `dangerouslySetInnerHTML`.
- [x] `strong` and `em` (allowed by the schema) use the library defaults (`<strong>`, `<em>`); there is no custom
      component for them.

### ResponsiveImage (server)

- [x] Props: `desktop` (required), `mobile` (optional), `alt: string | null`, `sizes` (default `100vw`), `priority`,
      `className`. The images are `SanityImageSource`, URLs come from `urlFor` (`@/lib/sanity/image`).
- [x] Intrinsic `width` and `height` are read from the asset `_ref` (`image-<id>-<w>x<h>-<ext>`) by `getDimensions`, so
      no query field is needed and the layout does not shift.
- [x] Renders nothing when the desktop image has no readable asset or its `_ref` does not match the pattern.
- [x] The mobile image is a `<source media="(max-width: 767px)">` with a `srcSet` from `getImageProps`; if the mobile
      image is empty or unreadable, desktop is used for all widths.
- [x] `alt` is `''` when empty (decorative image); the mobile `<source>` carries no `alt`.
- [x] `priority` sets `loading="eager"` and `fetchPriority="high"` on the `<img>`; otherwise `lazy` and `auto`.
      `next/image` `preload` is not used on purpose (comment in `ResponsiveImage.tsx`: it ignores `<source media>`
      and would also fetch the desktop image on mobile).
- [x] The `<img>` fills its container (`width/height: 100%`, `object-fit: cover`); the size comes from the caller's
      `className` on `<picture>`.

### Container (server)

- [x] Props: `children` only. A `div` with `width: 100%`, `margin-inline: auto` and `padding-inline` from
      `--container-padding`: 16px, 40px from `md` (768px), 80px and `max-width: 1920px` from `xl` (1280px), via
      `media-up`.

### InView (client leaf)

- [x] `"use client"`. Props: `as` (default `div`), `className`, `threshold` (default `0.5`), `children`.
- [x] Uses `useInView` (`@/hooks/useInView`, `IntersectionObserver`): the flag turns `true` the first time the
      threshold is reached and never turns back; the observer is disconnected then and on unmount.
- [x] Exposes the flag as `data-in-view` (`false`, then `true`). The content is always rendered, so crawlers and
      no-JS visitors see it unchanged; the animation itself lives in the consumer's CSS.
- [x] `InView` does not check reduced motion; the consumer's CSS must (as `Headline` does).

### Shared

- [x] Each folder has `index.ts` with a default re-export; `LinkButton` and `Button` also re-export their public types
      by name. Consumers import by folder.
- [x] Every CMS href passes `safeHref` or `safePath` before it reaches the DOM; `dangerouslySetInnerHTML` appears in
      `app/src` only for `themeScript` (`ThemeScript.tsx`), none of the seven blocks use it.
- [x] Styles are SCSS Modules with camelCase BEM (`button--primary`, `headline__accent`, `richText__link`,
      `responsiveImage__img`).

## Design

- **Schema:** none added; blocks `linkButton`, `responsiveImage`, `richText`, `headline` are described in
  [../specs/content-model.md](../specs/content-model.md#blocks-object-types).
- **Query:** the blocks have no query of their own. Their only consumer today is the `heroSection` branch of
  `PAGE_QUERY` (`queries.ts`: `headline`, `description`, `image` with a localized `alt`, `ctaButton` with a localized
  `label`).
- **UI:** server components by default. The only client code is `InView` (and the `useInView` hook behind it), pulled
  in by `Headline` only when `shine` is set.
- **Who uses what:**
  - `HeroSection`: `Container`, `Headline` (`as="p"`, `shine`), `RichText`, `LinkButton`, `ResponsiveImage`
    (`priority`, `sizes` mirroring the picture width).
  - `Header`: `Container`.
  - `ThemeSwitcher`: `Button`.
  - `HeroMetricNumber` uses `useInView` directly, not `InView`.
- **Edge cases:**
  - Empty or unsafe link, empty label: `LinkButton` returns `null`, no empty wrapper.
  - Unsafe link inside rich text: text stays, link goes.
  - Broken or missing asset `_ref`: `ResponsiveImage` returns `null`.
  - Unknown `variant` from the CMS (an API write can skip the schema): `LinkButton` falls back to `button--primary`.
    `Button` merges classes with `clsx`, which drops an `undefined` class.
  - `hasAnchor` with an `anchor` that does not match the pattern: the anchor is ignored.
  - `hasAnchor` with `linkType: external` or `download`: the anchor is ignored.
  - `download` with a stale `url` left from an earlier link type: `url` is ignored, the link comes from `download`.

## Files

- `app/src/components/ui/LinkButton/`: `LinkButton.tsx`, `.module.scss`, `types.ts`, `index.ts`.
- `app/src/components/ui/Button/`: `Button.tsx`, `.module.scss`, `types.ts` (`ButtonProps`, `ButtonVariant`), `index.ts`.
- `app/src/components/ui/Headline/`: `Headline.tsx`, `.module.scss` (accent colour, shine keyframes), `index.ts`.
- `app/src/components/ui/RichText/`: `RichText.tsx`, `.module.scss`, `index.ts`.
- `app/src/components/ui/ResponsiveImage/`: `ResponsiveImage.tsx`, `helpers.ts` (`getDimensions`),
  `.module.scss`, `index.ts`.
- `app/src/components/ui/Container/`: `Container.tsx`, `.module.scss`, `index.ts`.
- `app/src/components/ui/InView/`: `InView.tsx`, `index.ts`.
- `app/src/hooks/useInView.ts`: `IntersectionObserver` hook shared by `InView` and `HeroMetricNumber`.
- `app/src/lib/helpers/safeHref.ts`, `safePath.ts`: link allowlists used by `LinkButton` and `RichText`.

## Acceptance criteria

- [x] Blocks render in `en` and `uk`, light and dark, mobile and desktop.
- [ ] Empty or unexpected link and image data does not throw (null guards in `LinkButton`, `RichText`,
      `ResponsiveImage`).
- [x] `pnpm format`, `pnpm code-quality` and `pnpm build` pass in `app/`.

## Decisions

- The `transparent` `Button` variant (`--color-text`, no border or outline, so it reads as plain text) is the intended
  look for the theme switcher.
- The CMS colour variants (`primary`, `secondary`, `accent`) of `LinkButton` and `Button` live in one mixin,
  `button-variants` in `styles/_mixins.scss`. `transparent` is its own mixin, `button-variant-transparent`, included
  only by `Button`, so `LinkButton` has no `transparent` class and an unknown `variant` still falls back to `primary`.
  The hover treatment stays separate (`opacity` vs `filter`).
- Accepted: the anchor regex in `LinkButton.tsx` is a hand-made copy of the Studio one in
  `sanity-cms/schemaTypes/blocks/linkButton.ts`; the two can drift. The code comment does not name the schema file, on
  purpose.
- Accepted: `LinkButton.opensInNewTab` and `SocialLinks.opensInNewTab` hold the same text. Move it to a shared
  namespace if a third component needs it.
- `MOBILE_QUERY` and `DESKTOP_QUERY` in `lib/constants.ts` are tied to the `lg` breakpoint (1024px) by a comment; the
  values stay separate because the SCSS variable cannot be read from TypeScript.
- `Button` stays in `components/ui` although only `ThemeSwitcher` uses it: it is generic and carries the variants.

## Tasks

Done in the code.

## Open questions

- The null guards were read in the code but not exercised at runtime with empty or broken CMS data.
