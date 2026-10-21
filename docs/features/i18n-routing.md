# i18n and routing

Status: done (documented after implementation)

## Goal

The site is available in English and Ukrainian with clean URLs, and unknown paths show a localized 404.

## Requirements

- [x] Locales are `en` (default) and `uk`. The list is defined once, in `routing.ts`; `request.ts` needs a message
      loader for each locale (a missing one is a type error).
- [x] `localePrefix: 'as-needed'`: English at `/` without a prefix, Ukrainian at `/uk`.
- [x] The proxy (`proxy.ts`) runs next-intl's middleware for every path except `api`, `trpc`, `_next`, `_vercel` and
      paths with a file extension.
- [x] `<html lang>` is the current locale.
- [x] The `[locale]` layout, the home page, `projects` and `cases` validate the segment with `hasLocale` and call
      `notFound()` for an unknown one. `generateStaticParams` returns both locales, so pages are prerendered per locale.
- [x] Interface-only strings are in `messages/en.json` and `messages/uk.json` (same top-level namespaces in both:
      `NotFound`, `Header`, `ThemeSwitcher`, `LanguageSwitcher`, `LinkButton`, `SocialLinks`). Editable content stays in
      Sanity ([content-model](../specs/content-model.md)).
- [x] Message types come from `messages/en.json` (`appConfig.d.ts`), so a missing key in code is a type error.
- [x] `messages/uk.json` and `messages/en.json` must have the same keys at every level: `request.ts` fails type checking
      if a key is missing from one of them or left behind in it.
- [x] Internal links use `Link` from `i18n/navigation.ts`, which adds the locale prefix.
- [x] An unknown path inside a locale renders `[locale]/not-found.tsx` (title and a "back home" link, localized)
      through the `[...rest]` catch-all, which only calls `notFound()`.
- [x] `projects` and `cases` are placeholder routes: `<main id="main-content">` with an `<h1>` ("Projects", "Cases"),
      not translated and not linked from the navigation by this feature.

## Design

- **Config:** `i18n/routing.ts` (`defineRouting`), `i18n/navigation.ts` (`createNavigation`: `Link`, `redirect`,
  `usePathname`, `useRouter`, `getPathname`), `i18n/request.ts` (`getRequestConfig`). `next.config.ts` wires the
  next-intl plugin.
- **Request config:** takes the locale from the request, or from `next/root-params` when none is given (static
  rendering), calls `notFound()` if there is none, and loads messages through an explicit per-locale loader (keeps the
  types; a template-string import would be untyped).
- **Layout:** `NextIntlClientProvider` wraps the page; `lang` and `fetchSiteSettings(locale)` use the validated locale.
- **404:** there is no `global-not-found.tsx`; paths outside the proxy matcher get Next's default 404
  ([D7](../decisions.md), including the known issue with the `__next_error__` shell).
- **Related:** the `EN`/`UK` switcher, cookie and focus behavior are in [language-switcher.md](language-switcher.md).
  Why `as-needed`: [D2](../decisions.md).
- **Not implemented:** hreflang `<head>` tags; they are planned in Page metadata and SEO and listed on the roadmap
  Launch checklist. The proxy only sends next-intl's alternate-links `Link` header.

## Files

- `app/src/proxy.ts`: next-intl middleware and matcher.
- `app/src/i18n/routing.ts`: locales, default, prefix mode.
- `app/src/i18n/navigation.ts`: locale-aware `Link` and helpers.
- `app/src/i18n/request.ts`: per-request locale and messages.
- `app/src/i18n/appConfig.d.ts`: `Locale` and `Messages` types for next-intl.
- `app/messages/en.json`, `app/messages/uk.json`: interface strings.
- `app/src/app/[locale]/layout.tsx`: `hasLocale`, `generateStaticParams`, `<html lang>`, provider.
- `app/src/app/[locale]/not-found.tsx`, `[locale]/[...rest]/page.tsx`: localized 404.
- `app/src/app/[locale]/projects/page.tsx`, `cases/page.tsx`: placeholders.

## Acceptance criteria

- [x] The layout, pages and request config read the locale list from `routing.ts`.
- [ ] `/` is English, `/uk` is Ukrainian, `/en` redirects to `/`.
- [ ] An unknown path (`/xyz`, `/uk/xyz`) shows the 404 in the matching language.
- [ ] `/projects`, `/uk/projects`, `/cases`, `/uk/cases` render.
- [ ] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`.

## Tasks

Done in the code.

## Open questions

- Nothing here was run in a browser or build; the routing behavior is read from code and next-intl's documented
  behavior only.
- `not-found.tsx` renders `<main>` without `id="main-content"`, unlike the other pages. If the skip link targets
  `#main-content`, it does nothing on the 404 page. Proposed: add the id.
- `projects` and `cases` titles are hard-coded English strings, not in `messages/`. Proposed: leave until the pages
  are designed. Case pages are out of scope in `CLAUDE.md`, so `cases` should be removed or renamed.
