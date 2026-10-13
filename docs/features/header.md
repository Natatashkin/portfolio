# Header

Status: done (documented after implementation)

## Goal

A header on every page with the site name, navigation and theme switcher; on small screens the navigation, theme
switcher and social links move into a full-screen burger menu.

## Requirements

- [x] Skip link to `#main-content`, visible on keyboard focus only.
- [x] Logo shows `siteSettings.siteName` and links to the home page of the current locale; hidden when empty.
- [x] Navigation from `siteSettings.navigation`: `isAnchor` items link to `#<url>`, others to `/<url>` through the
      locale-aware `Link` after `safePath` (an invalid path renders no item); the current page gets `aria-current="page"`; items without a label are skipped.
- [x] From `lg` (1024px): inline navigation and theme switcher.
- [x] Below `lg`: burger toggle opens a full-screen panel with navigation, theme switcher and social links.
- [x] Menu closes on Escape (focus returns to the toggle), on a tapped link, and when the viewport reaches `lg`.
- [x] Page scroll is locked while the menu is open (`overflow: hidden` plus `lenis.stop()`).
- [x] All interface strings (skip link, navigation label, menu label) come from `messages/` (`Header`).

## Design

- **Data:** `fetchSiteSettings(locale)` in `[locale]/layout.tsx` (cache tag `site-settings`); props `navigation`,
  `siteName`, `socialLinks`.
  Labels use the `en` fallback from the query.
- **UI:** `Header` is a Server Component; `BurgerMenu` and `Navigation` are client components (state, `usePathname`).
  The header is absolutely positioned over the first section. Below `lg`, the header row takes `--color-bg` while
  the menu is open. `Navigation` is rendered twice (desktop row and burger panel); the copy for the other breakpoint
  is `display: none`, so assistive tech sees one navigation landmark.
- **Accessibility:** toggle has `aria-label`, `aria-expanded`, `aria-controls`; panel has `data-lenis-prevent` so it
  scrolls natively; menu transition is disabled with reduced motion. The closed panel is `visibility: hidden`, so
  its links are out of the tab order. The Escape listener is attached only while the menu is open.

## Files

- `app/src/components/layout/Header/`: layout, skip link, desktop/mobile split.
- `app/src/components/layout/BurgerMenu/`: toggle, panel, Escape/breakpoint/link closing, scroll lock.
- `app/src/components/ui/Navigation/`: list of anchor and page links (`NavigationItem` from TypeGen).
- `app/src/components/ui/Logo/`: site name link.
- `app/src/components/icons/`: `BurgerIcon`, `CloseIcon`.

## Acceptance criteria

- [x] Works in `en` and `uk`, light and dark, mobile and desktop.
- [x] Empty `siteName`, navigation or social links do not throw.
- [x] Keyboard: skip link, toggle, Escape, focus return.

## Decisions

- Anchor items keep linking to `#<url>` on every page while `/projects` and `/cases` are placeholders. When real
  pages appear, anchors on non-home pages switch to `/#<url>` (home + anchor).
- The header stays `position: absolute` (not sticky): the author's design decision.

## Open questions

- The language switcher and the theme switcher changes are done: see [language-switcher.md](language-switcher.md) and
  [theme-switcher.md](theme-switcher.md) (caveats are listed in their specs).
