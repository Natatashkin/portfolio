# Roadmap

## Done

- Next.js 16 app, TypeScript strict, ESLint/Prettier, Husky + lint-staged.
- Sanity Studio v6: blocks, documents and all eight section schemas with groups, validation, previews, insert-menu
  tiles; `siteSettings` singleton; Studio deployed on Vercel.
- Env-based Sanity client, `check-sanity` script, TypeGen wiring, `fetchPage` / `fetchSiteSettings`.
- next-intl routing (`en` at `/`, `uk` at `/uk`), localized 404, `messages/`.
- Tokens, themes with no-flash script, `useTheme`, `ThemeSwitcher`.
- UI blocks: Button, LinkButton, Headline, RichText, ResponsiveImage, Container, InView ([features/ui-blocks.md](features/ui-blocks.md)). Logo, Navigation and SocialLinks are part of the header and footer.
- Layout: Header, BurgerMenu, Footer. Lenis `SmoothScrollProvider` with GSAP loaded after idle ([features/smooth-scroll.md](features/smooth-scroll.md)).
- `HeroSection` (with `HeroMetricNumber`) and the shared `DotGrid`.
- Language switcher ([features/language-switcher.md](features/language-switcher.md)) in the desktop header and the burger menu.
- Theme switcher: label shows the target theme, the chosen theme survives a language switch ([features/theme-switcher.md](features/theme-switcher.md)).

## Next

1. Remaining sections in order of page flow, each with query, component, registration (see
   [features/README.md](features/README.md)): career, whatIDo, playground, projects, experience, techStack, cta.
2. Scroll animations per section (GSAP ScrollTrigger in client children; see the `scroll-animation` skill).
3. Page metadata and SEO: title, description, canonical, hreflang (D2), Open Graph, `sitemap.ts`, `robots.ts`.
4. Revalidate webhook (`api/revalidate`) and Studio webhook, see D4. Until it exists, edits reach the page after the
   hourly `revalidate`.
5. Draft preview via Draft Mode with a server-only read token (conventions: Security).
6. Final 404 design; resolve the `__next_error__` shell issue (decision D7).
7. Decide on security headers (decision D13).
8. Bring the header navigation back when work on the nested pages starts: it is hidden now and the code is commented
   out in `Header.tsx` ([features/header.md](features/header.md)).

## Deferred checks

The checks deferred by the author for done-with-caveats features are listed in the Open questions of their specs:
[language-switcher.md](features/language-switcher.md), [theme-switcher.md](features/theme-switcher.md).

## Launch checklist

- Remove `robots: noindex` from the root metadata.
- Add hreflang `<head>` tags (D2); not implemented yet (Page metadata and SEO).
- Switch Production Branch of both Vercel projects from `dev` to `main`.
- `sanity schema deploy` if a tool needs the cloud schema.
- Replace the `projects/` and `cases/` stub routes with real pages or remove them. With real pages, header anchor
  items on non-home pages must link to `/#<url>` (see [features/header.md](features/header.md)).
- Add the production domain to the Sanity CORS origins; allow the production site as the Studio preview origin.
- Clean READMEs reviewed; `pnpm code-quality` and `pnpm build` green in `app/`, Studio builds.

## Known issues

- Unknown paths render the 404 in the `__next_error__` shell (D7).
