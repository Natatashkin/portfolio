# Filter

Status: done

## Goal

A reusable multi-select row of chips that filters a list through the URL, so a filtered view can be shared and opened
directly. First use: the technology and skill filter on the [projects page](projects-page.md).

## Requirements

- [x] Props: `items: { label: string; value: string }[]` (without "All"), `value: string[]` (the selected slugs, from
      the server), `paramName` (default `filter`) and an accessible `label`.
- [x] Filter prepends the "All" chip itself; its label comes from `messages` (`Filter.all`), so callers never pass it.
- [x] URL format: repeated params, `?filter=next-js&filter=gsap`, written in the order of `items`, not of the clicks.
      No `filter` param means nothing is selected.
- [x] Several chips can be active at once. "All" is active only when nothing is selected.
- [x] Selecting a chip adds it and deactivates "All"; clicking an active chip deselects it; deselecting the last one
      makes "All" active again; clicking "All" clears every filter.
- [x] A direct link with one or more `filter` params opens with exactly those chips active. The page normalizes the
      values before passing `value` (rule: [projects-page.md](projects-page.md)).
- [x] A click replaces the URL (`router.replace` from `@/i18n/navigation`) with `scroll: false`: no new history entry
      and no scroll jump.
- [x] The clicked chip changes in the same frame (`useOptimistic` inside `startTransition`), before the new list
      arrives.
- [x] While the transition is pending the root has `data-pending`, so a sibling results container dims through CSS
      `:has()`, without shared JS state.
- [x] Semantics: the root is `role="group"` with the accessible `label`; each chip is a `button` with `aria-pressed`
      ("All" included).
- [x] Chips are at least 44 px high; on mobile the row scrolls sideways instead of wrapping (from `md` it wraps), with
      no page-level horizontal scroll.
- [x] Visible keyboard focus; light and dark themes through tokens; the highlight transition is removed under
      `prefers-reduced-motion`.
- [x] A client component, as small as possible: the chip row only. It does not call `useSearchParams`, so it needs no
      `<Suspense>` of its own.

## Design

- **Schema:** the filter key is the `slug` of `technology` and `skill` ([D31](../decisions.md)).
- **Query:** none inside Filter; the page passes `items` and `value` ([projects-page.md](projects-page.md)).
- **UI:** `components/ui/Filter/` (`Filter.tsx` with `"use client"`, `.module.scss`, `index.ts`, `types.ts`).
  - `handleSelect(slug)` toggles the chip in the optimistic list, keeps the order of `items` and writes it as
    repeated `paramName` params; an empty list removes the param. "All" writes an empty list.
  - The optimistic state resets to the `value` prop when the new server render arrives.
  - Chip styles come from the shared `chip` mixin in `_mixins.scss` (also used by the "Reset filters" link of the
    projects page). The row has 4 px padding with a matching negative margin only while it scrolls (below `md`), so
    `overflow` does not clip the focus ring.
- **Edge cases:** `items` empty renders only "All"; a long label wraps inside the chip; the chip key is its `value`.

## Files

- `app/src/components/ui/Filter/`: the component, styles, `types.ts`, `index.ts`.
- `app/messages/{uk,en}.json`: `Filter.all`.

## Acceptance criteria

- [x] A click updates the `filter` params without a scroll jump or a new history entry; the chip changes at once.
- [x] Two chips can be active; deselecting the last one activates "All"; "All" clears every filter.
- [x] A direct `?filter=a&filter=b` link opens with both chips active, in both locales.
- [ ] Deferred (author decision): a screen reader reads a group with its label and each chip's pressed state.
- [x] Chips scroll sideways at 390 px; targets are at least 44 px.
- [x] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`.

## Decisions

- URL state, not React state: a filtered view is shareable and the back button works.
- `replace`, not `push`: each chip click would otherwise fill the history.
- `data-pending` with `:has()` instead of a pending flag passed to the list: the list stays a Server Component.
- The current value is a server prop, not `useSearchParams`: the page already reads `searchParams` once, so the
  chip row needs no second `<Suspense>` ([caching.md](caching.md)).
- Multi-select with repeated params ([D31](../decisions.md)).
- Values are written in option order, not click order: the same selection always gives the same URL, and so the same
  cache key as the page's normalization.
- The chip look is a shared mixin, not a component: the "Reset filters" link of the empty state is a `Link` with the
  same look.

## Tasks

Done in the code.

## Open questions

- The screen-reader check is deferred (author decision); the `role="group"` and `aria-pressed` structure was checked.
