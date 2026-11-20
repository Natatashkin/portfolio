# Breadcrumbs

Status: approved

## Goal

A visitor on an inner page sees where they are and can go back up the path: `Home / Projects`,
`Home / Projects / [slug]`.

## Requirements

- [ ] Props: `items: { label: string; href?: string }[]`. The component always prepends `Home` (label from
      `messages/{uk,en}.json`, link `/` through `@/i18n/navigation`), so callers pass only the rest of the path.
- [ ] Shown on every page except the home page. Today that is `/projects`; the details page `projects/[slug]` is out of
      scope, but the shape already supports it.
- [ ] The last item is plain text with `aria-current="page"` and is never a link, even if it has an `href`.
- [ ] Earlier items with an `href` are locale-aware links; an item without an `href` renders as text.
- [ ] Markup: `nav` with an `aria-label` from `messages`, containing an `ol` with one `li` per item.
- [ ] The separator is a CSS `/` in a muted token, `aria-hidden`, so a screen reader hears the items only.
- [ ] Link targets are at least 44 px tall (WCAG 2.5.5 / 2.5.8 best practice) through a hit area that does not
      change the inline layout; the width follows the label (above the 24 px minimum of WCAG 2.5.8).
- [ ] Long labels wrap instead of widening the page.
- [ ] Light and dark themes through tokens; visible focus on links (the shared `focused-underline` mixin).
- [ ] No structured data (JSON-LD): SEO belongs to "Page metadata and SEO".

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

- [ ] On `/en/projects` and `/uk/projects` the trail is `Home / Projects` in the matching language; `Home` links to
      the locale's home page.
- [ ] The last item is not a link and carries `aria-current="page"`.
- [ ] A screen reader reads a navigation landmark with its label and a list of items, without the separators.
- [ ] Links are at least 44 px tall; keyboard focus is visible.
- [ ] Renders in light and dark, at 390 px and desktop widths.
- [ ] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`.

## Decisions

- `Home` is added inside the component: every trail starts there and the label is an interface string.
- The last item is never a link: it points at the current page.
- A trail has at least two items (`Home / …`): `Home` alone tells nothing, so the component renders nothing without
  other items, and the home page shows no breadcrumbs.
- The 44 px target applies to the height only: widening short labels like "Home" would push into the separator, and
  their width already passes the 24 px minimum of WCAG 2.5.8.

## Tasks

1. Component, styles and messages.
2. Browser check in both locales, both themes, 390 px and desktop, keyboard focus.
3. Sync: `docs-writer` marks the spec `done` and adds the component to `ui-blocks.md`.

## Open questions

- None.
