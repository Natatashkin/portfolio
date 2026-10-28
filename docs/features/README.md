# Features

One file per feature, written from [\_template.md](_template.md). A feature gets its spec before implementation
starts; features built before the spec-driven workflow are marked "done (documented after implementation)".

## Implemented

| Feature           | Covers                                                                                                     | Status             | Spec                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | ------------------ | -------------------------------------------- |
| Header            | Header, Logo, Navigation, BurgerMenu, skip link, theme switcher slot                                       | done               | [header.md](header.md)                       |
| Footer            | Footer, SocialLinks, copyright                                                                             | in progress        | [footer.md](footer.md)                       |
| Hero section      | HeroSection, HeroGrid, HeroMetricNumber, metrics                                                           | done               | [hero-section.md](hero-section.md)           |
| UI blocks         | LinkButton, Button, Headline, RichText, ResponsiveImage, Container, InView                                 | done               | [ui-blocks.md](ui-blocks.md)                 |
| Theming           | Light/dark themes, no-flash script, `useTheme`                                                             | done               | [theming.md](theming.md)                     |
| i18n and routing  | Locales, proxy, localized 404, `messages/`                                                                 | done               | [i18n-routing.md](i18n-routing.md)           |
| Smooth scroll     | SmoothScrollProvider, `loadGsap`, Lenis, GSAP loaded after idle, reduced motion                            | done               | [smooth-scroll.md](smooth-scroll.md)         |
| Language switcher | `EN`/`UK` link in the desktop header and the burger menu; hash, focus and announcement kept after a switch | done, with caveats | [language-switcher.md](language-switcher.md) |
| Theme switcher    | Label shows the theme a click leads to; the chosen theme survives a language switch                        | done, with caveats | [theme-switcher.md](theme-switcher.md)       |

## Planned

| Feature               | Notes                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------- |
| Career section        | Draft: [career-section.md](career-section.md); also extracts the shared `DotGrid`     |
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
