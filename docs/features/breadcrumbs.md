# Breadcrumbs

Status: done

## Goal

A visitor on an inner page sees where they are and can go back up the path: `Home / Projects`,
`Home / Projects / [slug]`.

## Requirements

- [x] Props: `items: { label: string; href?: string }[]`. The component always prepends `Home` (label from
      `messages/{uk,en}.json`, link `/` through `@/i18n/navigation`), so callers pass only the rest of the path.
- [x] Used by every inner page and never by the home page. Today that is `/projects`; the details page
      `projects/[slug]` is out of scope, but the shape already supports it.
- [x] The last item is plain text with `aria-current="page"` and is never a link, even if it has an `href`; it is
      drawn in `--color-accent-ink`.
- [x] Earlier items with an `href` are locale-aware links; an item without an `href` renders as text.
- [x] Markup: `nav` with an `aria-label` from `messages`, containing an `ol` with one `li` per item.
- [x] The separator is a CSS `/` (a pseudo-element, so a screen reader hears the items only) in a muted token.
- [x] Link targets are at least 44 px tall (WCAG 2.5.5 / 2.5.8 best practice) through a `::before` hit area that does
      not change the inline layout; the width follows the label (above the 24 px minimum of WCAG 2.5.8).
- [x] Long labels wrap instead of widening the page.
- [x] Light and dark themes through tokens; visible focus on links (the `muted-control` mixin, which includes
      `focused-underline`).
- [x] No structured data (JSON-LD): SEO belongs to "Page metadata and SEO".

## Design

- **Schema / Query:** none. On `/projects` the current label is `page.title` ([D32](../decisions.md)).
- **UI:** `components/ui/Breadcrumbs/` (`Breadcrumbs.tsx`, `.module.scss`, `index.ts`, `types.ts`); a Server Component,
  no client code, no animation. The page renders it above the `h1`.
- **Edge cases:** an empty `items` list renders nothing: `Home` alone is not a trail, and the home page has none; an item with an empty label is
  skipped. Items come from page code, not from the CMS href, so no extra link sanitizing is needed.

## Files

- `app/src/components/ui/Breadcrumbs/`: the component, styles, `types.ts`, `index.ts`.
- `app/messages/{uk,en}.json`: `Breadcrumbs.home`, `Breadcrumbs.label`.

## Acceptance criteria

- [x] On `/en/projects` and `/uk/projects` the trail is `Home / Projects` in the matching language; `Home` links to
      the locale's home page.
- [x] The last item is not a link and carries `aria-current="page"`.
- [ ] Deferred (author decision): a screen reader reads a navigation landmark with its label and a list of items, without the separators.
- [x] Links are at least 44 px tall; keyboard focus is visible.
- [x] Renders in light and dark, at 390 px and desktop widths.
- [x] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`.

## Decisions

- `Home` is added inside the component: every trail starts there and the label is an interface string.
- The last item is never a link: it points at the current page.
- A trail has at least two items (`Home / …`): `Home` alone tells nothing, so the component renders nothing without
  other items, and the home page shows no breadcrumbs.
- The 44 px target applies to the height only: widening short labels like "Home" would push into the separator, and
  their width already passes the 24 px minimum of WCAG 2.5.8.

## Tasks

Done in the code.

## Open questions

- The screen-reader check is deferred (author decision); the markup (`nav`, `ol`, CSS separator) was checked.
