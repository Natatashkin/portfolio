# Decisions

Short ADR-style log. Newest at the bottom. Add an entry when a choice is non-obvious or hard to reverse.

## D1. Two independent packages, no root workspace

`app/` and `sanity-cms/` have separate lockfiles and deploy to separate Vercel projects. The Studio can change and
deploy without touching the site; the schema is shared through TypeGen.

## D2. Locale routing: `as-needed`

English at `/` (no prefix, `/en` redirects), Ukrainian at `/uk`. Hreflang: en → `/`, uk → `/uk`, x-default → `/`.
Keeps the primary URL clean.

## D3. Field-level localization

`sanity-plugin-internationalized-array` (`en`, `uk`) instead of per-locale documents: one document per entity,
shared references and images. GROQ falls back to `en` when `uk` is empty; Studio validation requires all languages.

## D4. Static rendering with tag revalidation

Pages are SSG; the page fetch is tagged with every document type its query reads (`PAGE_QUERY_TAGS`: `page`,
`technology`, `skill`, `metric`; settings use `site-settings`); `revalidate = 3600` is a safety net. The Sanity client
uses `useCdn: false` so Next's cache is the only staleness layer.

The tags only take effect once the webhook route exists: until then an edit to any referenced document reaches the
page after the hourly `revalidate`. When a query starts dereferencing another type, extend `PAGE_QUERY_TAGS`, and make
the webhook map each document type to its tag.

## D5. Theme in `localStorage`, not a cookie

`theme` = `light` | `dark`, no value = system. The server never reads it, so pages stay static; a no-flash inline
script applies it before paint. All storage access is in try/catch. The switcher UI is a placeholder.

## D6. Link safety in two layers

Studio validation restricts schemes but API writes bypass it. The app applies a `safeHref` allowlist (`https`, `mailto`, `tel`)
to every external CMS href, re-checks internal paths with `safePath` (same regex as Studio) before the locale-aware `Link`, and never passes CMS data to `dangerouslySetInnerHTML` (only the constant `themeScript`).

## D7. No `global-not-found.tsx`

It needs the experimental `globalNotFound` flag. Localized 404s come from `[locale]/not-found.tsx` plus the
`[...rest]` catch-all; URLs outside the proxy matcher get Next's default 404. Known issue: unknown paths render the
404 inside the `__next_error__` shell (no SSR HTML, brief unstyled flash). Revisit when the 404 page is designed.

## D8. `@swc/core` pinned to 1.16.2

`next-intl`'s plugin loads `@swc/core` at config time. From 1.16.12 SWC unpacks its native addon into
`%LOCALAPPDATA%\swc` and Windows blocks loading it there, so `next dev` fails. The pin lives in `overrides` in
`app/pnpm-workspace.yaml`; remove it once SWC or next-intl changes this.

## D9. Sass `loadPaths`

Modules `@use 'mixins' as *;` through `sassOptions.loadPaths` (`src/styles`), the current Sass option
(`includePaths` is legacy).

## D10. One Lenis instance bound to the GSAP ticker

`SmoothScrollProvider` is the only place Lenis is created; `gsap.ticker` drives `lenis.raf` so ScrollTrigger and
Lenis share one loop. Skipped when `prefers-reduced-motion` is set.

## D11. `linkButton` reading rules

External `url` only if it passes `safeHref` (D6); internal gets `/` and the locale prefix. `anchor` is read only when `hasAnchor` is true because
Studio does not clear it when the toggle is turned off.

## D12. Pre-launch indexing off

Root metadata sets `robots: noindex`. Remove at launch together with switching the Vercel Production Branch of both
projects from `dev` to `main`.

## D13. Security headers (undecided)

A strict `script-src` CSP needs nonces (dynamic rendering, loses SSG) or experimental SRI, so it is not used.
Candidate: static headers in `next.config.ts` (CSP without script restriction: `object-src 'none'`,
`base-uri 'self'`, `frame-ancestors`, `form-action 'self'`; `nosniff`, `Referrer-Policy`, `Permissions-Policy`),
introduced as `Content-Security-Policy-Report-Only` first. Draft preview needs `frame-ancestors` to allow the Studio
origin. Ask before changing `next.config.ts`.
