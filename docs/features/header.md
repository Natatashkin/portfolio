# Header

Status: done (documented after implementation)

## Goal

A header on every page with the site name, navigation (hidden for now), theme switcher and language switcher; on
small screens the navigation, both switchers and social links move into a full-screen burger menu.

**Temporarily hidden (author's decision):** the navigation is not rendered in the header, desktop or burger panel,
until work on the nested pages starts. The component, its styles, the `navigation` prop and the `Header.navigation`
message are kept; how to restore it is in Open questions. Requirements below that mention the navigation describe
the behaviour once it is restored.

## Requirements

- [x] Skip link to `#main-content`, visible on keyboard focus only.
- [x] Logo shows `siteSettings.siteName` and links to the home page of the current locale; hidden when empty. Its
      vertical padding (`--space-1`) matches the navigation items and it has no side padding, so the text lines up with
      the container edge; keyboard focus uses the shared focus ring.
- [x] (Hidden for now, see Goal.) Navigation from `siteSettings.navigation`: `isAnchor` items link to `#<url>`,
      others to `/<url>` through the locale-aware `Link` after `safePath` (an invalid path renders no item); the
      current page gets `aria-current="page"`; items without a label are skipped.
- [x] From `lg` (1024px): inline navigation (hidden for now), theme switcher and language switcher; the switchers sit
      on the right (`header__controls` has `margin-inline-start: auto`, so they stay there without the navigation).
- [x] Below `lg`: burger toggle opens a full-screen panel. From the top: a centred row with the theme switcher and the
      language switcher, a 1px `--color-border` line under it, the navigation (hidden for now), and the social links
      at the bottom. (Author's decision.)
- [x] Menu closes on Escape (focus returns to the toggle), on a tapped link, and when the viewport reaches `lg`.
- [x] Page scroll is locked while the menu is open (`overflow: hidden` plus `lenis.stop()`).
- [x] All interface strings (skip link, navigation label, menu label) come from `messages/` (`Header`).

## Design

- **Data:** `fetchSiteSettings(locale)` in `[locale]/layout.tsx` (cache tag `site-settings`); props `navigation`,
  `siteName`, `socialLinks`.
  Labels use the `en` fallback from the query.
- **UI:** `Header` is a Server Component; `BurgerMenu` and `Navigation` are client components (state, `usePathname`).
  The header is absolutely positioned over the first section. Below `lg`, the header row takes `--color-bg` while
  the menu is open. When shown, `Navigation` is rendered twice (desktop row and burger panel); the copy for the other
  breakpoint is `display: none`, so assistive tech sees one navigation landmark. Not rendered for now (see Goal).
- **Accessibility:** toggle has `aria-label`, `aria-expanded`, `aria-controls`; panel has `data-lenis-prevent` so it
  scrolls natively; menu transition is disabled with reduced motion. The closed panel is `visibility: hidden`, so
  its links are out of the tab order. The Escape listener is attached only while the menu is open.

## Files

- `app/src/components/layout/Header/`: layout, skip link, desktop/mobile split.
- `app/src/components/layout/BurgerMenu/`: toggle, panel, Escape/breakpoint/link closing, scroll lock.
- `app/src/components/ui/Navigation/`: list of anchor and page links (`NavigationItem` from TypeGen); not used by
  `Header` for now.
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

- To restore when work on the nested pages starts: uncomment the `Navigation` import, the two `<Navigation … />`
  elements and the `navigation` destructuring in `Header.tsx`, remove the type-only import that replaces the default
  one, and re-check the burger panel order and the anchor links (see Decisions).
