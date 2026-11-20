# Roadmap

## Done

- Next.js 16 app, TypeScript strict, ESLint/Prettier, Husky + lint-staged.
- Sanity Studio v6: blocks, documents and all eight section schemas with groups, validation, previews, insert-menu
  tiles; `siteSettings` singleton; Studio deployed on Vercel.
- Env-based Sanity client, `check-sanity` script, TypeGen wiring, `fetchPage` / `fetchSiteSettings`.
- next-intl routing (`en` at `/`, `uk` at `/uk`), localized 404, `messages/`.
- Tokens, themes with no-flash script, `useTheme`, `ThemeSwitcher`.
- UI blocks: Button, LinkButton, Headline, RichText, ResponsiveImage, Container, InView ([features/ui-blocks.md](features/ui-blocks.md)). Logo, Navigation and SocialLinks are part of the header and footer.
- Layout: Header, BurgerMenu, Footer. Lenis `SmoothScrollProvider` with GSAP loaded after idle ([specs/theming-and-motion.md](specs/theming-and-motion.md#motion-lenis--gsap)).
- `HeroSection` (with `HeroMetricNumber`) and the shared `DotGrid`.
- `CareerSection` complete: desktop and mobile layout, text and steps scroll reveal, plain-list fallback with markers and lines, pulsing last marker, handwritten tagline ([features/career-section.md](features/career-section.md)).
- `ExperienceSection`: company timeline, entry toggle, card reveal, pinned intro, CV downloads, shared `TagList`
  ([features/experience-section.md](features/experience-section.md)); the Lenis trail check for its pin is open.
- `ProjectsSection`: project cards with About overlay, Live/GitHub buttons, tech stack
  ([features/projects-section.md](features/projects-section.md)); the `projects/<slug>` page behind About is not built, so the title and About link to `#` for now. The "All Projects" button leads to `/projects`.
- Projects page at `/projects` ([features/projects-page.md](features/projects-page.md)) with its building blocks: Cache Components on every fetcher ([caching](features/caching.md)), localized `page.title` and `slug` on technology and skill, [CTA section](features/cta-section.md), [breadcrumbs](features/breadcrumbs.md), [loading states](features/loading-states.md), [filter](features/filter.md). The screen-reader pass (breadcrumbs, filter, counter) is deferred.
- Language switcher ([features/language-switcher.md](features/language-switcher.md)) in the desktop header and the burger menu.
- Theme switcher: label shows the target theme, the chosen theme survives a language switch ([features/theme-switcher.md](features/theme-switcher.md)).
- Production Branch of both Vercel projects (Studio, app) is `main`; `dev` is the working branch and builds as Preview.

## Next

1. Remaining sections in order of page flow, each with query, component, registration (see
   [features/README.md](features/README.md)): whatIDo, playground, techStack.
2. Scroll animations for the remaining sections (GSAP ScrollTrigger in client children; see the `scroll-animation`
   skill; the career and experience sections are the references).
3. Page metadata and SEO: title, description, canonical, hreflang (D2), Open Graph, `sitemap.ts`, `robots.ts`.
4. Revalidate webhook: the route `api/revalidate` is built ([D30](decisions.md)). Left: set `SANITY_REVALIDATE_SECRET` in Vercel and
   create the Sanity webhook that points at it. Until then, edits reach the page after the 30-minute `cacheLife` ([features/caching.md](features/caching.md)).
5. Draft preview via Draft Mode with a server-only read token (conventions: Security).
6. Final 404 design; resolve the `__next_error__` shell issue (decision D7).
7. Decide on security headers. A strict `script-src` CSP needs nonces (dynamic rendering, loses SSG), so it is not used.
   Candidate: static headers in `next.config.ts` (CSP without script restriction, `nosniff`, `Referrer-Policy`,
   `Permissions-Policy`), introduced as `Content-Security-Policy-Report-Only` first; draft preview needs
   `frame-ancestors` to allow the Studio origin. Ask before changing `next.config.ts`.
8. Bring the header navigation back when work on the nested pages starts: it is hidden now and the code is commented
   out in `Header.tsx` ([features/header.md](features/header.md)).

## Launch checklist

- Remove `robots: noindex` from the root metadata.
- Add hreflang `<head>` tags (D2); not implemented yet (Page metadata and SEO).
- `sanity schema deploy` if a tool needs the cloud schema.
- Restore the project details links: the `TEMPORARY` `#` in `ProjectCard.tsx` (title and About) and the `#` branch in
  `LinkButton.tsx` (see [features/projects-section.md](features/projects-section.md)).
- The `projects/` list page is built ([features/projects-page.md](features/projects-page.md)); replace the `cases/` stub with a real page or remove it. With real pages, header anchor
  items on non-home pages must link to `/#<url>` (see [features/header.md](features/header.md)).
- Add the production domain to the Sanity CORS origins; allow the production site as the Studio preview origin.
- Clean READMEs reviewed; `pnpm code-quality` and `pnpm build` green in `app/`, Studio builds.

## Known issues

- Unknown paths render the 404 in the `__next_error__` shell (D7).
