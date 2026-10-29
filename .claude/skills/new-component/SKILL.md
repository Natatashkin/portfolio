---
name: new-component
description: Create or restructure a React component in this portfolio repo (app/src/components) — folder layout, index.ts re-export, SCSS Module with BEM and tokens, server vs client choice, props types, interface strings in messages/{en,uk}.json, naming of handlers. Use this whenever the author asks to add, build, split or move a component, a UI block, a layout piece or a hook, even if they don't mention conventions.
---

# New component

The rules are in `docs/conventions.md` (Components, Naming, SCSS, Data and i18n, Security). This skill gives the order
of work and a checklist; read the conventions instead of relying on memory. A landing section follows `new-section`
instead, and motion follows `scroll-animation`.

## Where it goes

| It is                                             | Place                                                     |
| ------------------------------------------------- | --------------------------------------------------------- |
| Reusable block (button, link, image, switcher)    | `app/src/components/ui/<Name>/`                           |
| Page frame (header, footer, burger, theme script) | `app/src/components/layout/<Name>/`                       |
| Landing section                                   | `new-section` skill                                       |
| Private child used by one component only          | own folder in the parent's (`CareerSection/CareerSteps/`) |
| Hook shared by components                         | `app/src/hooks/useThing.ts`                               |
| Hook used by one component                        | beside that component                                     |
| Pure helper                                       | `app/src/lib/helpers/` (exported through its barrel)      |

A private child gets its own folder (component, module, `index.ts`) and is imported by that folder, only by its parent. When a second component needs it, move it to `components/ui/`. Never name a folder
"widgets".

## Steps

1. **Check for a spec.** A behavior-carrying component needs `docs/features/<name>.md` first (`work-block` step 1).
   A purely visual piece that only composes existing blocks does not.
2. **Reuse before writing.** Look in `components/ui` (e.g. `Headline`, `RichText`, `LinkButton`, `ResponsiveImage`,
   `Container`, `Button`) and `styles/_mixins.scss` (e.g. `media-up`, `media-down`, `focus-ring`, `muted-control`,
   `visually-hidden`). Do not add a mixin or helper for one use.
3. **Create the folder** with `PascalCase.tsx`, `PascalCase.module.scss`, `index.ts` and, only for non-trivial types,
   `types.ts`. Copy the shape of `components/ui/LinkButton/`.
   - `index.ts` re-exports only: `export { default } from './Name';` and `export type { NameProps } from './types';`.
     No logic, no `export *`. Folder-level barrels exist only for `components/icons` and `lib/helpers`.
   - Consumers import the folder (`@/components/ui/Name`), never the inner file; use `@/` instead of `../`. Inside the
     folder, import types relatively.
4. **Server by default.** Add `"use client"` only for interactivity, browser APIs or animation, and keep that component
   a small leaf. Split a server component from its client leaf rather than marking the whole tree.
5. **Types.** Props that mirror Sanity content come from TypeGen (`@/sanity.types`), never hand-typed copies. No `any`,
   no non-null `!`; prefer `import type`.
6. **Styles.** SCSS Module, BEM in camelCase (`.card`, `.card__title`, `.card--accent`), nest with `&__` and `&--`, no
   element-of-element chains. Colors, spacing and radii only from tokens (`var(--...)`); no hard-coded values. Load
   mixins with `@use 'mixins' as *;`. Montserrat is the only font; no Tailwind.
7. **Strings.** Anything the interface says (labels, aria-labels, "more") goes to `app/messages/en.json` and
   `uk.json` in the same change, with the same keys. Editable content stays in Sanity. Server components read it with
   `useTranslations` / `getTranslations`.
8. **Nullable data renders nothing**, not an empty wrapper.
9. **Links and HTML.** A CMS-provided href goes through `safeHref`, an internal CMS path through `safePath` and the
   locale-aware `Link` from `@/i18n/navigation`. Never pass CMS data to `dangerouslySetInnerHTML`.
10. **Naming.** Handlers `handle<Thing>`, never `onChange` for your own functions; `useSyncExternalStore` subscribers
    `subscribeTo<Thing>` (empty one `subscribeNoop`). Hooks `useThing`; utilities `camelCase.ts`.
    Constants (timings, ids, keys, patterns) go to `lib/constants.ts`, in the group they belong to.
11. **Accessibility** (a11y practice, not a rule of `conventions.md`). Visible focus (the `focus-ring` mixin or
    `muted-control`), a name for every control, and, when an `aria-label` is used, the visible text inside it (WCAG
    2.5.3, as the language and theme switchers do).
12. **Comments** explain why, not what. No dead code.

## Verify

Per `work-block`: `pnpm format` and `pnpm code-quality` in `app/` (lint, format check, types and the circular
dependency check, the usual failure when a section imports from its renderer). If routes or data changed, also
`pnpm build`. Then look at the component in both locales and both themes at mobile and desktop widths, and say plainly
which of these you did not check.
