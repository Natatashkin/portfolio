# Conventions

`app/.prettierrc` and `app/eslint.config.mjs` are the source of truth for formatting and lint; this file covers what
they cannot express.

## TypeScript

- `strict`; no `any`, no non-null `!` to silence errors. Prefer `import type`.
- Prop and data types that mirror Sanity come from TypeGen (`@/sanity.types`, `SectionOf` from `@/lib/sanity/types`), never hand-typed copies.
- Prettier: single quotes, semicolons, no trailing commas, width 80. ESLint: Next base + strict TS, sorted imports,
  `@/` alias instead of `../`. Husky + lint-staged run both on commit.
- `sanity-cms/` has its own Prettier config in its `package.json` (no semicolons, width 100, no bracket spacing,
  single quotes). The two styles differ on purpose; format each package with its own `pnpm format`.

## Components

- One folder per component: `PascalCase.tsx`, `PascalCase.module.scss`, `index.ts`, optional `types.ts` (only for
  non-trivial types).
- `index.ts` re-exports only: `export { default } from './Navigation'`, and public types by name
  (`export type { NavigationItem } from './types'`). No logic, no `export *`, no folder-level barrels,
  with two named exceptions: `components/icons/index.ts` (a set of uniform icons, imported as
  `import { ArrowIcon } from '@/components/icons'`) and `lib/helpers/index.ts` (imported as
  `import { safeHref, safePath } from '@/lib/helpers'`). Both re-export by name only.
- Consumers import by folder (`@/components/ui/Navigation`), never the inner file. Inside the folder, import types
  relatively. Route files in `app/` keep Next's names and are not re-exported.
- A private client child sits flat in its parent's folder (`HeroSection/HeroGrid.tsx`) and is not re-exported; when a
  second component needs it, move it to `components/ui/`.
- Hooks shared by components go in `hooks/` (`useThing.ts`); a hook used by one component stays beside it.
- Server Components by default; `"use client"` only for interactivity or animation, as small leaf components.
- Never name a folder "widgets".

## Sections

- Server Component by default, named `<Section>`, props typed with `SectionOf<'<type>'>`:
  `import type { SectionOf } from '@/lib/sanity/types';`. The types live outside `SectionRenderer` on purpose:
  section components import them and `SectionRenderer` imports the sections, so keeping them in the renderer's folder
  would create a circular dependency.
- Root element is `<section id={anchorId ?? undefined}>` wrapped in `Container`.
- Compose from `components/ui` (`Headline`, `RichText`, `LinkButton`, `ResponsiveImage`); no hard-coded copy.
- Every nullable CMS field is handled: render nothing rather than an empty wrapper.
- Animated parts live in a private `"use client"` child in the section folder
  (see [specs/theming-and-motion.md](specs/theming-and-motion.md)).
- `SectionRenderer` renders nothing for an unknown `_type`, so a section added in Studio before its component exists
  never breaks the page.

## Sanity schemas

- Studio code follows its own Prettier config (see TypeScript above); schemas use `defineType` / `defineField`.
- A section schema lives in `sanity-cms/schemaTypes/sections/<name>Section.ts`, uses `sectionGroups` and
  `sectionPreview(label)` from `schemaTypes/lib/sectionFields.ts`, and has `anchorId` in the `settings` group
  (`^[a-z0-9-]+$`).
- Register it in `sections/sectionTypes.ts` (array order = insert-menu order) and add the tile
  `sanity-cms/static/sections/<type>.svg`.
- Localized fields use the internationalized-array types (`internationalizedArrayString`, `...Text`,
  `...RichText`, `...Headline`); required ones use `requiredInAllLanguages` from `schemaTypes/lib/localized.ts`.
- Field reference: [specs/content-model.md](specs/content-model.md).

## Naming

- Components `PascalCase`; hooks `useThing`; utilities `camelCase.ts`; folders under `src/lib/` kebab-case.
- Handlers and listener callbacks: `handle<Thing>`, never `onChange`. `useSyncExternalStore` subscribers:
  `subscribeTo<Thing>` (empty one: `subscribeNoop`).

## SCSS

- Colors, spacing and radii are CSS custom properties from `_tokens.scss`; never hard-code them.
- Mixins stay minimal (breakpoints, focus ring, visually-hidden, `muted-control` shared by the theme and language
  switchers and the social links, `button-variants` / `button-variant-transparent` for `Button` and `LinkButton`).
  Breakpoints are SCSS variables.
- BEM in camelCase: `.hero`, `.hero__stackItem`, `.linkButton--accent`; nest with `&__` / `&--`; no
  element-of-element chains.

## Data and i18n

- GROQ only in `app/src/lib/sanity/queries.ts` with `defineQuery`; fetchers in `lib/sanity/api/`. Always pass
  `locale`; project only needed fields; write localized selects literally (TypeGen cannot read interpolated strings).
- Client config comes from env variables (`lib/sanity/env.ts`), never hardcoded IDs; `apiVersion` is pinned.
- Interface strings in `app/messages/{uk,en}.json`; Studio-editable content never goes there.
- Rich text via `@portabletext/react` with our own `components` and SCSS Modules.
- Errors: `[locale]/not-found.tsx` exists; add `error.tsx` per route segment when a route needs one. Helpers throw
  typed errors or call `notFound()`.

## Icons

Icons are never stored in Sanity. They are components in `components/icons/`, mapped from the free-string `iconKey`
(and the `hasIcon` flag on `linkButton`); an unknown key renders no icon and never throws.

## Security

- Every absolute CMS href goes through `safeHref` (allowlist `https`, `mailto`, `tel`; anything else, including
  relative paths, returns `null` and renders no link).
- Every internal CMS path goes through `safePath` (the Studio regex for slash-less paths, re-checked at runtime
  because API writes skip Studio validation); it returns `/<path>` or `null`. The result is rendered through the
  locale-aware `Link` (`LinkButton` with `linkType: internal`, `Navigation`).
- `dangerouslySetInnerHTML` is used only for the constant `themeScript`.
- Secrets never reach client code; `NEXT_PUBLIC_` only for non-secret values.
- `lib/sanity/env.ts` and `client.ts` can be imported from client code. When draft preview is built (roadmap),
  the read token (`SANITY_API_READ_TOKEN`) lives in a separate server-only client (`import 'server-only'`) that
  client code never imports.

## Comments

Explain why, not what. No dead code. The repo is read by employers.
