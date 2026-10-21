# Portfolio: web app

Bilingual (English / Ukrainian) portfolio landing built with Next.js 16, React 19 and strict TypeScript. Content is
managed in Sanity and rendered as reusable section blocks.

## Stack

Next.js (App Router) · React 19 · TypeScript · SCSS Modules · next-intl · next-sanity + GROQ · GSAP + Lenis

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in the Sanity values
pnpm dev                     # http://localhost:3000
```

Environment variables are listed in `.env.example`.

## Scripts

| Command             | What it does                                                            |
| ------------------- | ----------------------------------------------------------------------- |
| `pnpm dev`          | Start the dev server                                                    |
| `pnpm build`        | Production build                                                        |
| `pnpm start`        | Serve the production build                                              |
| `pnpm lint`         | ESLint                                                                  |
| `pnpm format`       | Prettier (write)                                                        |
| `pnpm format:check` | Prettier (check only)                                                   |
| `pnpm type-check`   | `tsc --noEmit`                                                          |
| `pnpm code-quality` | Lint, format check, type check and circular-dependency check in one run |
| `pnpm typegen`      | Regenerate Sanity types from the Studio schema                          |

Check the Sanity connection (prints OK / FAIL per check, never values):

```bash
node --env-file-if-exists=.env.local scripts/check-sanity.mts
```

## Structure

```
src/app/[locale]/   routes (layout, home, not-found, [...rest], projects, cases)
src/components/     ui/, sections/, layout/, icons/, SmoothScrollProvider
src/hooks/          shared hooks (theme, in-view, mounted)
src/lib/sanity/     client, queries, fetchers, image helpers
src/lib/            helpers/ (link safety, locale switch), theme/, motion/, constants
src/i18n/           next-intl routing and config
src/styles/         tokens, mixins, globals
messages/           interface strings (en, uk)
```

Full documentation, specs and conventions: [`../docs`](../docs/README.md). The CMS lives in
[`../sanity-cms`](../sanity-cms/README.md).
