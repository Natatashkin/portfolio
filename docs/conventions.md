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
  non-trivial types). Shared and derived types (items derived from TypeGen types, shapes used by more than one file) live in
  the component or section `types.ts`, not in helper files; a section keeps one `types.ts` for itself and its private
  children. A small props type used by one component may stay beside it.
- A block that already exists in one component and is needed in a second is not written again: the existing markup
  and styles are promoted into a component in `components/ui/` (`TagList`, taken from the hero) and both places use
  it. Check the code for the block before creating a new one.
- `index.ts` re-exports only: `export { default } from './Navigation'`, and public types by name
  (`export type { NavigationItem } from './types'`). No logic, no `export *`, no folder-level barrels,
  with two named exceptions: `components/icons/index.ts` (a set of uniform icons, imported as
  `import { ArrowIcon } from '@/components/icons'`) and `app/src/lib/helpers/index.ts` (imported as
  `import { safeHref, safePath } from '@/lib/helpers'`). Both re-export by name only. Pure helpers are grouped by
  topic in files there (`dateFormatters.ts`, `richText.ts`), not in a file named after one section. The Studio has the same
  kind of barrel in `sanity-cms/schemaTypes/lib/helpers/index.ts`.
- Consumers import by folder (`@/components/ui/Navigation`), never the inner file. Inside the folder, import types
  relatively. Route files in `app/` keep Next's names and are not re-exported.
- A private child sits in its own folder inside its parent's (`CareerSection/CareerSteps/` with its module and
  `index.ts`) and is imported by that folder; it is not used outside the parent. When a second component needs it,
  move it to `components/ui/`. A small client leaf with no styles of its own may stay flat
  (`HeroSection/HeroMetricNumber.tsx`).
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
- Shared Studio constants (e.g. `DATE_OPTIONS`, the `DD-MM-YYYY` date input format) live in
  `schemaTypes/lib/constants.ts`; pure helpers (e.g. `formatDate` for list previews) in
  `schemaTypes/lib/helpers/<name>.ts`, re-exported by name from `schemaTypes/lib/helpers/index.ts` (import `from '../lib/helpers'`).
- Content documents (`project`, `experience`, `skill`, `piece`, `road`, `metric`, `technology`, `downloadDocument`) are drag-and-drop
  orderable inside their collection in the Studio: each has `orderRankField({type})` and `orderRankOrdering`, and
  `structure.ts` lists them with `orderableDocumentListDeskItem` (`@sanity/orderable-document-list`). Keep `CONTENT_TYPES`
  in `structure.ts` in sync with the schemas that carry the field. Studio-only: queries do not sort by `orderRank`; the
  site order comes from the section references.
- Field reference: [specs/content-model.md](specs/content-model.md).

## Naming

- Components `PascalCase`; hooks `useThing`; utilities `camelCase.ts`; folders under `src/lib/` kebab-case.
- Constants are `UPPER_SNAKE_CASE` and live in `lib/constants.ts`, grouped by meaning with a comment per group (media
  queries, storage keys, timing, DOM ids, patterns). Exceptions: GROQ and its cache tags stay in
  `lib/sanity/queries.ts`, and `DEFAULT_API_VERSION` stays in `lib/sanity/apiVersion.ts` so a script can import it
  without loading `env.ts`.
- Handlers and listener callbacks: `handle<Thing>`, never `onChange`. `useSyncExternalStore` subscribers:
  `subscribeTo<Thing>` (empty one: `subscribeNoop`).

## SCSS

- Colors, spacing and radii are CSS custom properties from `_tokens.scss`; never hard-code them.
- Mixins stay minimal (breakpoints, focus ring, visually-hidden, `muted-control` shared by the theme and language
  switchers and the social links, `button-variants` / `button-variant-transparent` for `Button` and `LinkButton`).
  Breakpoints are SCSS variables.
- BEM in camelCase: `.hero`, `.hero__stack`, `.linkButton--accent`; nest with `&__` / `&--`; no
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

## UI verification

Ticking a spec criterion means it was seen in the browser, not that the code looks right. Applies to any block with a
visible or interactive change (see `work-block`). Pick what the change can affect; do not run everything for a
one-line style fix.

**Tools.** Playwright MCP (`mcp__playwright__*`) is the default: navigation, resizing, snapshots, screenshots,
console, network. Chrome DevTools MCP (`mcp__chrome-devtools__*`) only where Playwright falls short: computed styles,
`prefers-reduced-motion` / color-scheme emulation, Lighthouse, performance traces. Load the tools in one ToolSearch
call. If they are missing or fail after two or three attempts, stop and tell the author; never claim a browser check
that did not run. Library docs come from Context7; UI code is written with the `frontend-design` skill in mind.

**Setup.** `cd app && pnpm dev` (background), `http://localhost:3000`. Next 16 dev writes to `.next/dev`, so
`next dev` and `next build` can run together; a second `next dev` will not start, so reuse the running one. Widths:
about 390 px (mobile), 844 px (burger menu, below `lg` at 1024 px), 1400 px (desktop).

**What to check.**

- **Locales:** `/` (en) and `/uk`.
- **Themes:** set `localStorage.theme` to `light`, `dark`, or remove it (system); reload. With the key removed there
  is no `data-theme` attribute and the theme follows the browser preference.
- **Console:** `browser_console_messages`; look for `hydrat`, `Warning`, `Error`.
- **Accessibility tree:** `browser_snapshot`: order, names, only one copy of a duplicated control exposed (desktop
  row and burger panel both exist; CSS hides the other). Visible text must be part of an `aria-label`.
- **Keyboard:** tab order, visible focus, Escape closes the burger menu and returns focus to the toggle, Enter/Space
  on controls.
- **Soft locale switch:** click the language link, not a reload. A marker set on `window` must survive; the whole
  `[locale]` layout remounts (D14), so check `<html lang>`, `data-theme`, `color-scheme`, the `theme-ready` class,
  scroll lock, focus returning to the visible language switcher, and rebuilt animation state.
- **No JavaScript:** `curl -s http://localhost:3000/` shows the content in the server HTML. That alone does not prove
  it is visible: also check the CSS for elements hidden until JS runs (`opacity: 0`, `visibility: hidden`, initial
  animation states).
- **Reduced motion:** `browser_emulate_media` (Playwright) or `emulate` (chrome-devtools) with
  `prefers-reduced-motion: reduce`. If it cannot be set, say so and check the code (`gsap.matchMedia`, the CSS media
  query). Content must be fully visible, with no non-essential motion.
- **Assets:** `browser_network_requests` for failed images or fonts when the change touches media.

**Report** (in the author's language). Say which checks ran with the concrete result, and which did not and why. Tick
a criterion only for what was observed; mark a code-only check as "from code, not checked in the browser". A real
screen reader is never available: state announcements as "checked in the accessibility tree", not as heard. Record a
defect as a finding with the repro (locale, theme, width, steps); do not fix it unprompted.
