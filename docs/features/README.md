# Features

One file per feature, written from [\_template.md](_template.md). A feature gets its spec before implementation
starts; features built before the spec-driven workflow are marked "done (documented after implementation)".

Cross-cutting infrastructure (theming, smooth scroll, i18n and routing) is described in
[../specs/theming-and-motion.md](../specs/theming-and-motion.md) and [../specs/architecture.md](../specs/architecture.md).

## Implemented

| Feature            | Covers                                                                                                                    | Status                 | Spec                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------- |
| Header             | Header, Logo, Navigation, BurgerMenu, skip link, theme switcher slot                                                      | done                   | [header.md](header.md)                         |
| Footer             | Footer, SocialLinks, copyright                                                                                            | in progress            | [footer.md](footer.md)                         |
| Hero section       | HeroSection, DotGrid, HeroMetricNumber, metrics                                                                           | done                   | [hero-section.md](hero-section.md)             |
| UI blocks          | LinkButton, Button, Headline, RichText, ResponsiveImage, Container, InView                                                | done                   | [ui-blocks.md](ui-blocks.md)                   |
| Language switcher  | `EN`/`UK` link in the desktop header and the burger menu; hash, focus and announcement kept after a switch                | done, with caveats     | [language-switcher.md](language-switcher.md)   |
| Theme switcher     | Label shows the theme a click leads to; the chosen theme survives a language switch                                       | done, with caveats     | [theme-switcher.md](theme-switcher.md)         |
| Career section     | CareerSection, CareerText, CareerSteps, GSAP reveal, plain list, markers and lines, pulse, handwritten tagline            | done                   | [career-section.md](career-section.md)         |
| Experience section | Company cards on a timeline, CV downloads, entry toggle, GSAP card reveal, pinned intro, TagList                          | done, with open checks | [experience-section.md](experience-section.md) |
| Projects section   | Project cards, title link, hover-only blur + About, Live/GitHub by `iconKey`, 4-line summary, equal heights, All Projects | done                   | [projects-section.md](projects-section.md)     |

The revalidate webhook (`app/src/app/api/revalidate/route.ts`) is built; see [../specs/architecture.md](../specs/architecture.md)
and [caching.md](caching.md).

## Planned

| Feature               | Notes                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Projects page         | `/projects` list, URL filter, page sections from Sanity: [projects-page.md](projects-page.md) |
| Caching               | Cache Components: `use cache`, tags, Suspense for request data: [caching.md](caching.md)      |
| Breadcrumbs           | Reusable trail on every page except home: [breadcrumbs.md](breadcrumbs.md)                    |
| Filter                | Reusable URL-driven chip filter: [filter.md](filter.md)                                       |
| Loading states        | Loader, `loading.tsx`, ProjectCardSkeleton: [loading-states.md](loading-states.md)            |
| What I do section     |                                                                                               |
| Playground section    | Needs a `componentKey` → demo map                                                             |
| Tech stack section    |                                                                                               |
| CTA section           | Reusable CTA: layouts, background, buttons: [cta-section.md](cta-section.md)                  |
| Page metadata and SEO | Title, description, canonical, hreflang (required before launch), Open Graph, sitemap         |
| Draft preview         | Draft Mode, server-only read token                                                            |

Metrics are part of the hero; there is no separate metrics section. Schemas for all planned sections already exist ([../specs/content-model.md](../specs/content-model.md)); each planned section
still needs a query branch, a component and its `SectionRenderer` case. Section rules:
[../conventions.md](../conventions.md#sections).
