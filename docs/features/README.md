# Features

One file per feature, written from [\_template.md](_template.md). A feature gets its spec before implementation
starts; features built before the spec-driven workflow are marked "done (documented after implementation)".

## Implemented

| Feature           | Covers                                                                                                     | Status              | Spec                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------- |
| Header            | Header, Logo, Navigation, BurgerMenu, skip link, theme switcher slot                                       | done                | [header.md](header.md)                       |
| Footer            | Footer, SocialLinks, copyright                                                                             | done                | [footer.md](footer.md)                       |
| Hero section      | HeroSection, HeroGrid, HeroMetricNumber, metrics                                                           | done                | [hero-section.md](hero-section.md)           |
| UI blocks         | LinkButton, Button, Headline, RichText, ResponsiveImage, Container, InView                                 | done                | pending                                      |
| Theming           | Light/dark themes, no-flash script, `useTheme`, ThemeSwitcher                                              | done                | pending                                      |
| i18n and routing  | Locales, proxy, localized 404, `messages/`                                                                 | done                | pending                                      |
| Smooth scroll     | Lenis + GSAP ticker, ScrollTrigger sync, reduced motion                                                    | done                | pending                                      |
| Language switcher | `EN`/`UK` link in the desktop header and the burger menu; hash, focus and announcement kept after a switch | done, with caveats  | [language-switcher.md](language-switcher.md) |
| Theme switcher    | Label shows the theme a click leads to; the chosen theme survives a language switch                        | done, with a caveat | [theme-switcher.md](theme-switcher.md)       |

## Planned

| Feature               | Notes                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------- |
| Career section        |                                                                                       |
| What I do section     |                                                                                       |
| Playground section    | Needs a `componentKey` → demo map                                                     |
| Projects section      | `projects/` route is a placeholder                                                    |
| Experience section    | Empty `periodEnd` renders a localized "Present"                                       |
| Tech stack section    |                                                                                       |
| CTA section           |                                                                                       |
| Page metadata and SEO | Title, description, canonical, hreflang (required before launch), Open Graph, sitemap |
| Revalidate webhook    | Secret-checked route handler → `revalidateTag`                                        |
| Draft preview         | Draft Mode, server-only read token                                                    |

Metrics are part of the hero; there is no separate metrics section. Schemas for all planned sections already exist ([../specs/content-model.md](../specs/content-model.md)); each planned section
still needs a query branch, a component and its `SectionRenderer` case. Section rules:
[../conventions.md](../conventions.md#sections).
