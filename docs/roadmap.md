# Roadmap

## Done

- Next.js 16 app, TypeScript strict, ESLint/Prettier, Husky + lint-staged.
- Sanity Studio v6: blocks, documents and all nine section schemas with groups, validation, previews, insert-menu
  tiles; `siteSettings` singleton; Studio deployed on Vercel.
- Env-based Sanity client, `check-sanity` script, TypeGen wiring, `fetchPage` / `fetchSiteSettings`.
- next-intl routing (`en` at `/`, `uk` at `/uk`), localized 404, `messages/`.
- Tokens, themes with no-flash script, `useTheme`, temporary `ThemeSwitcher`.
- UI blocks: Button, LinkButton, Headline, RichText, ResponsiveImage, Container, InView ([features/ui-blocks.md](features/ui-blocks.md)). Logo, Navigation and SocialLinks are part of the header and footer.
- Layout: Header, BurgerMenu, Footer. Lenis + GSAP `SmoothScrollProvider`.
- `HeroSection` (with `HeroGrid`, `HeroMetricNumber`).
- Language switcher ([features/language-switcher.md](features/language-switcher.md)) in the desktop header and the burger menu.
- Theme switcher: label shows the target theme, the chosen theme survives a language switch ([features/theme-switcher.md](features/theme-switcher.md)).

## Next

1. Remaining sections in order of page flow, each with query, component, registration (see
   [features/README.md](features/README.md)): career, whatIDo, playground, projects, experience, techStack, cta.
2. Scroll animations per section (GSAP ScrollTrigger in client children).
3. Page metadata: title, description, canonical, hreflang alternates, Open Graph; `sitemap.ts`, `robots.ts`.
4. Webhook route handler (`api/revalidate`, secret-checked, `revalidateTag`) and Studio webhook. The page fetch already
   carries the tags for every document type it reads (D4); the webhook must map each document type to its tag. Until
   it exists, edits reach the page after the hourly `revalidate`.
5. Draft preview via Draft Mode with the read token in a separate server-only client (see conventions: Security).
6. Final 404 design; resolve the `__next_error__` shell issue (decision D7).
7. Decide on security headers (decision D13).
8. Final theme switcher design.
9. Bring the header navigation back when work on the nested pages starts: it is hidden now and the code is commented
   out in `Header.tsx` ([features/header.md](features/header.md)).

## Deferred checks

Done-with-caveats features whose remaining checks were deferred by the author:

- Real screen reader: the announcement of a language change (also after a full document load) and the accessible names of both switchers ([language-switcher.md](features/language-switcher.md), [theme-switcher.md](features/theme-switcher.md)).
- Language switcher: the `#hash` landing on a section (needs a section with an anchor id) and the `/projects` ↔ `/uk/projects` check (needs a second page).

## Launch checklist

- Remove `robots: noindex` from the root metadata.
- Add hreflang `<head>` tags (en → `/`, uk → `/uk`, x-default → `/`); not implemented yet (Page metadata and SEO).
- Switch Production Branch of both Vercel projects from `dev` to `main`.
- `sanity schema deploy` if a tool needs the cloud schema.
- Replace the `projects/` and `cases/` stub routes with real pages or remove them. With real pages, header anchor
  items on non-home pages must link to `/#<url>` (see [features/header.md](features/header.md)).
- Add the production domain to the Sanity CORS origins; allow the production site as the Studio preview origin.
- Clean READMEs reviewed; `pnpm code-quality` and `pnpm build` green in `app/`, Studio builds.

## Known issues

- Unknown paths render the 404 in the `__next_error__` shell (D7).
- `app/src/app/[locale]/projects` and `cases` are placeholders.
