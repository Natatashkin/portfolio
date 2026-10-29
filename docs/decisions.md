# Decisions

Short ADR-style log. Newest at the bottom. Add an entry when a choice is non-obvious or hard to reverse.

## D1. Two independent packages, no root workspace

`app/` and `sanity-cms/` have separate lockfiles and deploy to separate Vercel projects. The Studio can change and
deploy without touching the site; the schema is shared through TypeGen.

## D2. Locale routing: `as-needed`

English at `/` (no prefix, `/en` redirects), Ukrainian at `/uk`. Keeps the primary URL clean. The proxy also sends
next-intl's alternate-links `Link` header (with `x-default`). Not implemented yet, required before launch (for SEO,
on the Launch checklist): hreflang `<head>` tags (en → `/`, uk → `/uk`, x-default → `/`), built in the Page metadata
and SEO feature.

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
script applies it before paint. All storage access is in try/catch. The switcher renders both labels in the server HTML and CSS
picks one from `data-theme` (set by the script before paint), so the button is there from the first paint. The script runs only
on a document load, and a soft locale switch makes React remove `data-theme`, `color-scheme` and `theme-ready` from
`<html>`. Resolved: `ThemeScript` (one mount point in the root layout) calls `restoreTheme()` in a `useLayoutEffect` on
mount and renders the inline script only on the server and during hydration (details in [features/theme-switcher.md](features/theme-switcher.md)).

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

## D10. One Lenis instance on its own loop, GSAP loaded after idle

`SmoothScrollProvider` is the only place Lenis is created; it runs its own `requestAnimationFrame` loop and stays in
the first bundle. GSAP and ScrollTrigger are loaded dynamically (`loadGsap`) when the browser is idle, to keep them out
of the first bundle (Lighthouse showed one chunk with GSAP, Lenis and `next-intl` of about 54 KB gzip). Once loaded,
`SmoothScrollProvider` calls `ScrollTrigger.update` from a `useLenis` callback (root instance, survives instance
rebuilds); the callback does nothing until GSAP is loaded. Reason for not driving Lenis from `gsap.ticker` (the
earlier design): the clock would change between the two loops and `lenis.raf` would get a negative delta. Trade-off:
a scrubbed animation may trail Lenis by a frame; revisit when real scroll animations exist. With
`prefers-reduced-motion` Lenis stays mounted but gets `smoothWheel: false` and GSAP is not loaded. The tree must not
change shape with the preference: the server snapshot is `false`, so rendering bare `children` for reduced motion
remounted the header, page and footer on every load (checked: the mount count of `ThemeSwitcher` doubled). Lenis
1.3.26 only makes programmatic scrolls instant under reduced motion (`respectReducedMotion`), so the wheel needs
`smoothWheel: false` explicitly.

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

## D14. State across a locale switch: `sessionStorage` and a live region outside React

A locale switch is a soft navigation, but the whole `[locale]` layout subtree is remounted (the segment key changes),
verified in Chrome. React state and React-owned DOM (a live region, for example) are lost. What must survive goes
through one short-lived `sessionStorage` entry `{hash, at}` that the new layout reads and clears
(`lib/helpers/localeSwitch.ts`), remembered only for a plain left click, and the language-change live region is
created in `document.body` outside React. After a 150 ms timer `LanguageAnnouncer` restores the hash with
`history.replaceState`, returns keyboard focus to the visible switcher (the remount drops it to `<body>`) and
announces; focus uses `preventScroll` because the scroll position is already settled, and the effect cleanup clears
both timers. An entry older than 10 s is discarded (stale: no announcement, no focus move). Details:
[features/language-switcher.md](features/language-switcher.md).

## D15. Download link in `linkButton`

Downloadable files live in a `downloadDocument` collection ("Documents" in Studio): each document has a `title` and a
`files` object with one PDF per language (`en` required, `uk` optional). The CV is one such document, so a new CV needs no deploy. A visitor
does not think of switching the site language to get the other CV, so the Career section shows one button per language
version (`buttons[]`), whatever the site locale. `linkType` gets a third value, `download` (shown as "Download"), and
the button has a `download` object: a `document` reference and the `language` version of it (a reference cannot carry
the language, so both sit in one object); label, variant and icon work as for any button, so the
author translates each label in Studio. The app reads `download.document->files[download.language].asset->url` in GROQ (only for
`linkType == "download"`), passes it through `safeHref` (D6) and appends `?dl=<filename>` (the asset's
`originalFilename`, fallback `DEFAULT_DOWNLOAD_FILENAME` (`document.pdf`)), because the `download` attribute is ignored for a cross-origin CDN URL
and the Sanity CDN answers `?dl=` with `Content-Disposition: attachment`. Each `file` field sets
`options.accept: 'application/pdf'`, so the upload picker offers PDF only (a hint of the browser file dialog, not a hard
server-side check). The files are a plain object, not `internationalizedArrayFile`: the plugin's array UI picked every
version at once and the object is simpler to read in GROQ.
Rejected: one document per language file (the picker lists "CV" twice and the author tells them apart by hand); a file in `app/public/` (every CV change is a commit and a deploy), a file
inside each button (the author would upload it again for every button), a fixed `en` / `uk` pair in `siteSettings`
(not reusable for other documents) and picking the file by the site locale (the visitor would have to switch the site
language).

## D16. Shared `DotGrid` (was the hero's `HeroGrid`)

The pointer-lit dot grid moves from `components/sections/HeroSection/` to `components/ui/DotGrid` because the Career
section uses it too (desktop `lg` up only); the convention is to move a private child to `components/ui/` when a second
component needs it. The `HERO_GRID_*` constants become `DOT_GRID_*`. Behaviour is unchanged. Done as the first block of
[features/career-section.md](features/career-section.md).

## D17. Private child in its own folder; one layout rendered per viewport after hydration

A private child gets its own folder inside the parent's (`CareerSection/CareerSteps/` with its own module and
`index.ts`) and is imported by folder, like any component: the parent's module stays small and the child's styles have
one owner. It is still not shared; a second user moves it to `components/ui/`.

`CareerSteps` is needed in two places of the DOM (a column on mobile, an overlay on the cover on desktop). The server
does not know the viewport, so it renders both variants and CSS hides one; `CareerSteps` (client leaf, `useIsMobile`
over `useSyncExternalStore`, server snapshot `null`) then drops the variant that does not match, also after a resize.
Reason: the author wanted no repeated ids and one list in the DOM for assistive tech. Trade-off: until hydration the
markup is duplicated and the step data is serialised twice in the RSC payload. The mobile breakpoint in TypeScript is a
single `MOBILE_QUERY` (`(max-width: 1023px)`, the complement of `DESKTOP_QUERY`, mirrors `lg`); `MOBILE_MAX_WIDTH` is
gone.
