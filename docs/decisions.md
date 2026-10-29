# Decisions

Short ADR-style log. Newest at the bottom. Add an entry when a choice is non-obvious or hard to reverse: the decision
and one reason, plus a cost only if it changes how someone must work. Details live in the feature spec or the code.

## D1. Two independent packages, no root workspace

`app/` and `sanity-cms/` have separate lockfiles and deploy to separate Vercel projects, so the Studio can change and
deploy without touching the site; the schema is shared through TypeGen.

## D2. Locale routing: `as-needed`

English at `/` (no prefix, `/en` redirects), Ukrainian at `/uk`: the primary URL stays clean. Not implemented yet and
required before launch (SEO, Launch checklist): hreflang `<head>` tags (en → `/`, uk → `/uk`, x-default → `/`).

## D3. Field-level localization

`sanity-plugin-internationalized-array` (`en`, `uk`) instead of per-locale documents: one document per entity, shared
references and images. GROQ falls back to `en` when `uk` is empty; Studio validation requires all languages.

## D4. Static rendering with tag revalidation

Pages are SSG; the page fetch is tagged with every document type its query reads (`PAGE_QUERY_TAGS`), `revalidate =
3600` is a safety net, and the Sanity client uses `useCdn: false` so Next's cache is the only staleness layer. The tags
take effect only once the revalidate webhook exists. When a query starts dereferencing another type, extend
`PAGE_QUERY_TAGS` and map the type to its tag in the webhook.

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

## D9. Sass `loadPaths`

Modules use `@use 'mixins' as *;` through `sassOptions.loadPaths` (`src/styles`), the current Sass option.

## D10. One Lenis instance on its own loop, GSAP loaded after idle

`SmoothScrollProvider` is the only place Lenis is created; it runs its own `requestAnimationFrame` loop. GSAP and
ScrollTrigger load dynamically (`loadGsap`) when the browser is idle, to keep them out of the first bundle, and
`ScrollTrigger.update` is called from a `useLenis` callback. Lenis is not driven from `gsap.ticker`: the two clocks
differ and `lenis.raf` would get a negative delta. Cost: a `scrub`/`pin` animation may trail Lenis by a frame. Under
reduced motion Lenis stays mounted with `smoothWheel: false` and GSAP is not loaded; the tree must not change shape
with the preference (it remounted the page on every load).

## D11. `linkButton` reading rules

An external `url` is used only if it passes `safeHref` (D6); an internal one gets `/` and the locale prefix. `anchor` is
read only when `hasAnchor` is true, because Studio does not clear it when the toggle is turned off.

## D12. Pre-launch indexing off

Root metadata sets `robots: noindex`. Remove it at launch together with switching the Vercel Production Branch of both
projects from `dev` to `main`.

## D13. Security headers (undecided)

A strict `script-src` CSP needs nonces (dynamic rendering, loses SSG), so it is not used. Candidate: static headers in
`next.config.ts` (CSP without script restriction, `nosniff`, `Referrer-Policy`, `Permissions-Policy`), introduced as
`Content-Security-Policy-Report-Only` first; draft preview needs `frame-ancestors` to allow the Studio origin. Ask
before changing `next.config.ts`.

## D14. State across a locale switch: `sessionStorage` and a live region outside React

A locale switch is a soft navigation, but the whole `[locale]` layout is remounted, so React state and React-owned DOM
are lost. What must survive (the hash, then focus and the announcement) goes through one short-lived `sessionStorage`
entry `{hash, at}` that the new layout reads and clears, and the live region is created in `document.body` outside
React. Details: [features/language-switcher.md](features/language-switcher.md).

## D15. Download link in `linkButton`

Downloadable files live in a `downloadDocument` collection ("Documents" in Studio) with one PDF per language (`en`
required, `uk` optional), so a new CV needs no deploy. The Career section shows one button per language version
(`buttons[]`), whatever the site locale, because a visitor does not think of switching the site language to get the
other CV. `linkType` gets a third value, `download`, and the button holds a `document` reference plus the `language`
version. GROQ reads `download.document->files[download.language].asset->url`, the app passes it through `safeHref`
(D6) and appends `?dl=<filename>` (the asset's `originalFilename`, fallback `document.pdf`): the `download` attribute
is ignored for a cross-origin CDN URL, and the Sanity CDN answers `?dl=` with `Content-Disposition: attachment`.

## D16. Shared `DotGrid` (was the hero's `HeroGrid`)

The dot grid moves to `components/ui/DotGrid` and `HERO_GRID_*` becomes `DOT_GRID_*`. Reason: the Career section needs it
too, and a private child moves to `components/ui/` when a second component uses it. Behaviour is unchanged.

## D17. Private child in its own folder; one layout rendered per viewport after hydration

A private child gets its own folder inside the parent's (`CareerSection/CareerSteps/`, module and `index.ts`) and is
imported by folder, so each module has one owner.

`CareerSteps` is needed in two places (mobile column, desktop overlay). The server renders both variants and CSS hides
one; after hydration (`useIsMobile`) the client drops the variant that does not match. Reason: no repeated ids and one
list in the DOM for assistive tech. Cost: duplicate markup and payload until hydration.

## D18. Career reveal with GSAP + ScrollTrigger, not CSS `useInView`

The Career section reveals text and steps with GSAP + ScrollTrigger (`scroll-animation` skill), not CSS `useInView`:
a staggered sequence per breakpoint driven by scroll does not fit one in-view flag. The server HTML stays final; the
hidden state comes from GSAP only, never from CSS.

The last marker's pulse is a CSS animation started by the reveal and runs continuously. An endless animation over 5s is a
WCAG 2.2.2 concern; accepted because the ring is decorative (`aria-hidden`) and off under reduced motion. Details:
[features/career-section.md](features/career-section.md).

## D19. Caveat as the handwriting accent font next to Montserrat

Montserrat stays the text font. Caveat (`--font-handwritten`) is the project's one handwriting accent, used only where
the design asks for it and never for body text; today only the career tagline. Reason: a pen-like face fits a personal
sign-off and Caveat has full Cyrillic. Accepted cost: one more font file (about 50 KB latin, about 94 KB for `uk`),
loaded on page load because the tagline is in the DOM; to be re-checked in production.

## D20. The career tagline needs a cover or steps

The tagline shows only together with a cover or steps. Reason: it closes the road picture and the steps, so without them
it has nothing to close.
