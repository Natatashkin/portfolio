# Decisions

Short ADR-style log of project-wide decisions only; feature-level decisions live in the feature spec's Decisions
section. Add an entry when a choice is non-obvious, hard to reverse and affects more than one feature: the decision and
one reason. Numbers are stable; gaps are decisions that moved to a feature spec.

## D1. Two independent packages, no root workspace

`app/` and `sanity-cms/` have separate lockfiles and deploy to separate Vercel projects, so the Studio can change and
deploy without touching the site; the schema is shared through TypeGen.

## D2. Locale routing: `as-needed`

English at `/` (no prefix, `/en` redirects), Ukrainian at `/uk`: the primary URL stays clean. Not implemented yet and
required before launch (SEO, Launch checklist): hreflang `<head>` tags (en → `/`, uk → `/uk`, x-default → `/`).

## D3. Field-level localization

`sanity-plugin-internationalized-array` (`en`, `uk`) instead of per-locale documents: one document per entity, shared
references and images. GROQ falls back to `en` when `uk` is empty; Studio validation requires all languages.

## D5. Theme in `localStorage`, not a cookie

`theme` = `light` | `dark`, no value = system. The server never reads it, so pages stay static; a no-flash inline
script applies it before paint. A soft locale switch makes React remove the theme attributes from `<html>`, so
`ThemeScript` restores them on mount. Details: [features/theme-switcher.md](features/theme-switcher.md).

## D6. Link safety in two layers

Studio validation restricts schemes but API writes bypass it, so the app applies a `safeHref` allowlist (`https`,
`mailto`, `tel`) to every external CMS href, re-checks internal paths with `safePath` and never passes CMS data to
`dangerouslySetInnerHTML`.

## D7. No `global-not-found.tsx`

It needs the experimental `globalNotFound` flag. Localized 404s come from `[locale]/not-found.tsx` and the `[...rest]`
catch-all. Known issue: unknown paths render the 404 inside the `__next_error__` shell (no SSR HTML, brief unstyled
flash); revisit when the 404 page is designed.

## D8. `@swc/core` pinned to 1.16.2

From 1.16.12 SWC's native addon is blocked on Windows and `next dev` fails. The pin is in `overrides` in
`app/pnpm-workspace.yaml`; remove it once SWC or next-intl changes this.

## D10. One Lenis instance on its own loop, GSAP loaded after idle

`SmoothScrollProvider` is the only place Lenis is created; it runs its own `requestAnimationFrame` loop. GSAP and
ScrollTrigger load dynamically (`loadGsap`) when the browser is idle, to keep them out of the first bundle, and
`ScrollTrigger.update` is called from a `useLenis` callback. Lenis is not driven from `gsap.ticker`: the two clocks
differ and `lenis.raf` would get a negative delta. Cost: a `scrub`/`pin` animation may trail Lenis by a frame; the
Experience section is the second GSAP user (reveal and an intro pin, no scrub), and the trail check for the pin is
still pending. Under reduced motion Lenis stays mounted with `smoothWheel: false` and GSAP is not loaded; the tree must
not change shape with the preference (it remounted the page on every load).

## D12. Pre-launch indexing off

Root metadata sets `robots: noindex`. Remove it at launch. The Vercel Production Branch of both projects is already
`main`, so the site stays unindexed until this flag is removed.

## D19. Caveat as the handwriting accent font next to Montserrat

Montserrat stays the text font. Caveat (`--font-handwritten`) is the project's one handwriting accent, used only where
the design asks for it and never for body text; today only the career tagline. Reason: a pen-like face fits a personal
sign-off and Caveat has full Cyrillic. Accepted cost: one more font file (about 50 KB latin, about 94 KB for `uk`),
loaded on page load because the tagline is in the DOM; to be re-checked in production.

## D30. Cache Components + tag revalidation

Pages are statically rendered with `cacheComponents: true`: the Sanity fetchers use `'use cache'`, `cacheTag` (the tag
arrays in `queries.ts`) and a 30-minute `cacheLife`, and the client keeps `useCdn: false` so Next's cache is the only
staleness layer. The Sanity webhook calls `api/revalidate` → `revalidateTag`, so edits appear at once; `cacheLife` is
only the fallback for a missed webhook. Reason: the projects page reads `?filter=` (request data), which a route-level
`revalidate` cannot combine with a static shell. When a query starts dereferencing another type, extend its tag array
and the webhook filter. Details: [features/caching.md](features/caching.md).

## D31. `slug` on technology and skill is the filter key

The projects filter uses a required `slug` on `technology` and `skill`, unique across both types (a custom
`isUnique` check, since one key must name one chip). Reason: a slug is the same in both locales, so a shared
`?filter=` link works in `uk` and `en`. The filter is multi-select: repeated params
(`?filter=next-js&filter=gsap`), a project must match all selected slugs.
Details: [features/filter.md](features/filter.md), [features/projects-page.md](features/projects-page.md).

## D32. `page.title` is localized and is the visible `h1`

`page.title` becomes `internationalizedArrayString` (required in `en`) and is no longer an internal name; the slug is
generated from the `en` value, and the Studio preview needs a `prepare` that reads the `en` title from the array.
Reason: the projects page needs a localized `h1` and breadcrumb label from Studio. Existing page titles are
re-entered by the author. Details: [features/projects-page.md](features/projects-page.md).

## D33. No shared `[locale]/loading.tsx`, no generic loader

Loading is a local `<Suspense>` fallback next to the data that streams (the `ProjectCardSkeleton` grid on the projects
page). Reason: a boundary at `[locale]` level forces a prerendered shell for the catch-all `[...rest]`, where the
header's `usePathname` would have to sit in its own `<Suspense>` or the build fails, and a prerendered shell means the
fallback would never show. Details: [features/loading-states.md](features/loading-states.md).
