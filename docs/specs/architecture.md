# Architecture

## Stack

| Layer   | Choice                                                                           |
| ------- | -------------------------------------------------------------------------------- |
| App     | Next.js 16 (App Router), React 19, TypeScript strict, Sass Modules               |
| i18n    | `next-intl`, locales `en` (default) and `uk`, `localePrefix: "as-needed"`        |
| CMS     | Sanity Studio v6 + `sanity-plugin-internationalized-array`, dataset `production` |
| Data    | `next-sanity` client, GROQ with `defineQuery`, TypeGen types (`@/sanity.types`)  |
| Motion  | Lenis + GSAP/ScrollTrigger, GSAP loaded after idle (`SmoothScrollProvider`)      |
| Tooling | pnpm, ESLint (Next + strict TS, sorted imports), Prettier, Husky + lint-staged   |
| Hosting | Two Vercel projects: `app` (root `app`) and Studio (root `sanity-cms`, `dist`)   |

`app/` and `sanity-cms/` are independent packages; the only link between them is the Sanity schema, shared through
TypeGen (`pnpm typegen` in `app/` runs the Studio's `typegen`).

## Folder map (`app/src/`)

```
proxy.ts                  next-intl proxy (Next 16 name for middleware)
app/[locale]/             layout (root layout), page, not-found, [...rest] catch-all, projects/, cases/ stubs
components/
  ui/                     reusable blocks (Button, LinkButton, ResponsiveImage, RichText, Headline, ...)
  sections/               one component per Sanity section + SectionRenderer
  layout/                 Header, Footer, BurgerMenu, ThemeScript
  icons/                  icon components
  SmoothScrollProvider/   the single Lenis + GSAP setup
hooks/                    useTheme, useSystemTheme, useInView, useIsMounted
i18n/                     routing.ts, request.ts, navigation.ts, appConfig.d.ts
lib/constants.ts          all shared constants, grouped by meaning (media queries, storage keys, timing, patterns)
lib/sanity/               env, apiVersion, client, image, queries, types (Section, SectionOf), api/ (fetchPage, fetchSiteSettings)
lib/helpers/              safeHref, safePath, localeSwitch (re-exported by index.ts)
lib/motion/               loadGsap (dynamic GSAP + ScrollTrigger import)
lib/theme/                theme storage + the no-flash inline script
styles/                   _tokens.scss, _mixins.scss, globals.scss
```

Outside `src/`: `messages/{en,uk}.json`, `scripts/check-sanity.mts` (connection check, prints OK/FAIL only).

## Routing and locales

- English at `/` (no prefix; `/en` redirects to `/`), Ukrainian at `/uk`. Route segment `[locale]`.
- Implemented: routing (`as-needed`), the proxy, and next-intl's alternate-links `Link` response header from the proxy
  (includes an `x-default` entry for non-domain routing).
- **Not implemented yet, required before launch:** hreflang HTML `<head>` tags (en → `/`, uk → `/uk`, x-default → `/`)
  via Page `alternates` in the Page metadata and SEO feature. No `alternates`/hreflang code exists in `app/src` yet.
  It is on the Launch checklist in [../roadmap.md](../roadmap.md).
- `proxy.ts` matcher excludes `api`, `trpc`, `_next`, `_vercel` and paths with a file extension.
- Unknown paths hit `[locale]/[...rest]` and call `notFound()`, rendering the localized `[locale]/not-found.tsx`.

## Rendering and data flow

1. `LocaleLayout` validates the locale, fetches `siteSettings`, renders `Header`, `Footer` and providers.
2. `HomePage` fetches the `page` with slug `home` through `fetchPage(slug, locale)`.
3. `SectionRenderer` maps each section's `_type` to a Server Component; unknown types render nothing.
4. A client child exists only where a section animates or needs state.

- Statically generated (`generateStaticParams` over locales). Fetches carry cache tags (`page`, `technology`, `skill`,
  `metric`, `site-settings`), and `revalidate = 3600` is the fallback if a webhook is missed.
- The client uses `useCdn: false`; freshness comes from Next's cache plus tag revalidation.
- Localization: queries pick `field[language == $locale]` and fall back to `en` when the value is empty.
- Images go through Sanity's asset pipeline (`@sanity/image-url`) and `next/image`; remote pattern is
  `cdn.sanity.io/images/**`.
- Pre-launch the root metadata sets `robots: noindex`; remove it at launch.

## Planned (not built yet)

Draft preview via Draft Mode; page-level metadata (title, description, canonical, hreflang, Open Graph); static
security headers. See [../roadmap.md](../roadmap.md).

## Revalidation webhook

`POST /api/revalidate` (`app/src/app/api/revalidate/route.ts`). A Sanity webhook sends the changed document; the route
verifies the signature with `SANITY_REVALIDATE_SECRET` (`parseBody` from `next-sanity/webhook`), maps `_type` to a cache
tag (`siteSettings` → `site-settings`, any other type is its own tag) and calls `revalidateTag(tag, { expire: 0 })`.
A bad signature returns 401, an unparsable body or a missing `_type` 400, a missing secret 500. A signed webhook for
an unknown type returns 200 with `{ revalidated: null }`, so Sanity does not retry it.

Sanity webhook setup (dashboard → API → Webhooks): URL `https://<site>/api/revalidate`, trigger on create, update and
delete, filter `_type in ["page","technology","skill","metric","road","downloadDocument","siteSettings"]`, projection
`{_type}`, the same secret, dataset `production`.

## Environment variables (names only, see `app/.env.example`)

| Name                             | Purpose                                          | Status  |
| -------------------------------- | ------------------------------------------------ | ------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`  | Sanity project ID                                | used    |
| `NEXT_PUBLIC_SANITY_DATASET`     | Sanity dataset (`production`)                    | used    |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Pinned Sanity API version date                   | used    |
| `SANITY_API_READ_TOKEN`          | Server-only read token for drafts / preview      | planned |
| `SANITY_REVALIDATE_SECRET`       | Secret for the revalidate webhook route          | used    |
| `NEXT_PUBLIC_SITE_URL`           | Canonical site URL (metadata, hreflang, sitemap) | planned |
