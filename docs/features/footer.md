# Footer

Status: in progress (documented after implementation)

## Goal

A footer on every page with the copyright line and social links.

## Requirements

- [x] Copyright from `siteSettings.copyright` (localized, `en` fallback); hidden when empty.
- [x] Social links from `siteSettings.socialLinks`, opened in a new tab with `rel="noopener noreferrer"`.
- [x] Every social URL passes through `safeHref`; an unsafe or empty URL, or an empty label, renders no item.
- [x] Each link carries a visually hidden "(opens in a new tab)" note; the list has an aria-label (`SocialLinks`
      messages).
- [x] The content is wrapped in `Container`, so its gutters match the header and the sections.
- [x] `SocialLinks` get the hover and focus styles of the theme switcher (`muted-control`), without the dot. It is
      shared with the burger menu, so both copies change.
- [ ] A top row of the footer with the logo, the location (`siteSettings.location`) and links to future pages. Where
      the location goes and how the row is laid out is not decided yet.
- [ ] Back-to-top control (label `siteSettings.backToTopLabel`). It is a separate fixed element, not part of the
      footer layout, and appears while scrolling down once three sections from the top of the page have been passed.

## Design

- **Data:** `fetchSiteSettings(locale)` in `[locale]/layout.tsx` (cache tag `site-settings`); props `copyright`,
  `socialLinks`. The query already returns `location` and `backToTopLabel`; the footer does not render them yet. The
  localized `name` is not shown anywhere for now; it stays in the settings and may be removed.
- **UI:** `Footer` and `SocialLinks` are Server Components. `SocialLinks` is shared with the burger menu.
- **Styles:** flex row that wraps, top border, muted copyright text; tokens only. The social links use the
  `muted-control` mixin (`styles/_mixins.scss`), like the theme and language switchers, without the dot.

## Files

- `app/src/components/layout/Footer/`: copyright and social links.
- `app/src/components/ui/SocialLinks/`: safe external links (`SocialLink` from TypeGen).

## Acceptance criteria

- [x] Works in `en` and `uk`, light and dark, mobile and desktop.
- [x] Empty copyright or social links do not throw.
- [x] Unsafe URLs (anything but `https`, `mailto`, `tel`, including relative paths) are not rendered.

## Tasks

1. Top row: logo, location, links to future pages.
2. Back-to-top control as a separate fixed element; it will need its own client component and its own spec.

## Open questions

None.
