# Roadmap

## Done

- Next.js 16 app, TypeScript strict, ESLint/Prettier, Husky + lint-staged.
- Sanity Studio v6: blocks, documents and all nine section schemas with groups, validation, previews, insert-menu
  tiles; `siteSettings` singleton; Studio deployed on Vercel.
- Env-based Sanity client, `check-sanity` script, TypeGen wiring, `fetchPage` / `fetchSiteSettings`.
- next-intl routing (`en` at `/`, `uk` at `/uk`), localized 404, `messages/`.
- Tokens, themes with no-flash script, `useTheme`, placeholder `ThemeSwitcher`.
- UI blocks: Button, LinkButton, Headline, RichText, ResponsiveImage, Logo, Navigation, SocialLinks, Container, InView.
- Layout: Header, BurgerMenu, Footer. Lenis + GSAP `SmoothScrollProvider`.
- `HeroSection` (with `HeroGrid`, `HeroMetricNumber`).

## Next

1. Language switcher (not built yet): switches between `/` and `/uk` on the same page.
2. Remaining sections in order of page flow, each with query, component, registration (see
   [features/README.md](features/README.md)): career, whatIDo, playground, projects, experience, techStack, cta.
3. Scroll animations per section (GSAP ScrollTrigger in client children).
4. Page metadata: title, description, canonical, hreflang alternates, Open Graph; `sitemap.ts`, `robots.ts`.
5. Webhook route handler (`api/revalidate`, secret-checked, `revalidateTag`) and Studio webhook. The page fetch already
   carries the tags for every document type it reads (D4); the webhook must map each document type to its tag. Until
   it exists, edits reach the page after the hourly `revalidate`.
6. Draft preview via Draft Mode with the read token in a separate server-only client (see conventions: Security).
7. Final 404 design; resolve the `__next_error__` shell issue (decision D7).
8. Decide on security headers (decision D13).
9. Final theme switcher design.

## Launch checklist

- Remove `robots: noindex` from the root metadata.
- Switch Production Branch of both Vercel projects from `dev` to `main`.
- `sanity schema deploy` if a tool needs the cloud schema.
- Replace the `projects/` and `cases/` stub routes with real pages or remove them. With real pages, header anchor
  items on non-home pages must link to `/#<url>` (see [features/header.md](features/header.md)).
- Add the production domain to the Sanity CORS origins; allow the production site as the Studio preview origin.
- Clean READMEs reviewed; `pnpm code-quality` and `pnpm build` green in `app/`, Studio builds.

## Known issues

- Unknown paths render the 404 in the `__next_error__` shell (D7).
- `app/src/app/[locale]/projects` and `cases` are placeholders.
