# Footer

Status: done (documented after implementation)

## Goal

A footer on every page with the copyright line and social links.

## Requirements

- [x] Copyright from `siteSettings.copyright` (localized, `en` fallback); hidden when empty.
- [x] Social links from `siteSettings.socialLinks`, opened in a new tab with `rel="noopener noreferrer"`.
- [x] Every social URL passes through `safeHref`; an unsafe or empty URL, or an empty label, renders no item.
- [x] Each link carries a visually hidden "(opens in a new tab)" note; the list has an aria-label (`SocialLinks`
      messages).

## Design

- **Data:** `fetchSiteSettings(locale)` in `[locale]/layout.tsx` (cache tag `site-settings`); props `copyright`,
  `socialLinks`.
- **UI:** `Footer` and `SocialLinks` are Server Components. `SocialLinks` is shared with the burger menu.
- **Styles:** flex row that wraps, top border, muted copyright text; tokens only.

## Files

- `app/src/components/layout/Footer/`: copyright and social links.
- `app/src/components/ui/SocialLinks/`: safe external links (`SocialLink` from TypeGen).

## Acceptance criteria

- [x] Works in `en` and `uk`, light and dark, mobile and desktop.
- [x] Empty copyright or social links do not throw.
- [x] Unsafe URLs (anything but `https`, `mailto`, `tel`, including relative paths) are not rendered.

## Decisions

- `location`, `backToTopLabel` and the localized `name` are already fetched with the settings; they will be rendered
  in the footer when it is reworked (not yet built).
- The footer will be wrapped in `Container` in the same rework, so its gutters match the header and sections.

## Tasks

1. Footer rework: `Container`, location, back-to-top link (`backToTopLabel`), `name`.
