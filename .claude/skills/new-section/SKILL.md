---
name: new-section
description: Add or change a landing page section in this portfolio repo end to end — spec, Sanity schema (sanity-cms), GROQ branch with locale fallback and cache tags, TypeGen, Server Component with SCSS Module, SectionRenderer case, and docs. Use this whenever the author mentions a section such as career, whatIDo, playground, projects, experience, techStack or cta, asks to "build", "implement" or "add" a section or block on the page, or changes a section's fields.
---

# New section

A section is a Sanity object in `page.sections`, rendered by a Server Component chosen in `SectionRenderer`. The
hero is the reference implementation: read `docs/features/hero-section.md` and
`app/src/components/sections/HeroSection/` before starting.

The rules live in `docs/conventions.md` (Sanity schemas, Sections, Components, SCSS, Data and i18n, Security) and the
fields in `docs/specs/content-model.md`. This skill gives the order of work and the traps; read the conventions
rather than relying on memory.

## Blocks

Each step is one block run with the `work-block` skill (verify, review, report, wait for approval).

### 1. Spec

Run the `docs-writer` agent in mode `draft` to write `docs/features/<name>-section.md` and get it approved. Decide in
the spec: which fields render, empty-state behavior, client child for animation (if any), interface strings.

### 2. Schema (only if fields change)

Follow conventions → Sanity schemas and keep `docs/specs/content-model.md` in step with the schema. Never deploy the
schema or write to the dataset without asking.

### 3. Query and types

- Add a `_type == "<type>Section" => { ... }` branch to `PAGE_QUERY` in `app/src/lib/sanity/queries.ts`; project only
  the fields the component renders.
- Write each localized select literally (TypeGen cannot read interpolated strings). There are two fallback forms; copy
  the right one from the hero branch:
  - strings and text: `defined(f[language == $locale][0].value) && f[language == $locale][0].value != ""`
  - Portable Text (`headline`, `richText`): `... && count(f[language == $locale][0].value) > 0`
- Filter dangling references with `[defined(@->_id)]`, and add every newly dereferenced document type to
  `PAGE_QUERY_TAGS`.
- `cd app && pnpm typegen`.

### 4. Component

- Folder `app/src/components/sections/<Name>Section/`; props `SectionOf<'<type>Section'>` from `@/lib/sanity/types`
  (conventions → Sections explains why not from `SectionRenderer`).
- Buttons and links: `LinkButton` / `RichText` already route CMS hrefs through `safeHref`; any other CMS href must
  too (conventions → Security).
- Interface strings ("more", "present", aria-labels) go to `app/messages/{en,uk}.json`, never into Sanity or the
  component (conventions → Data and i18n).
- Animation only in a private `"use client"` child in the same folder (`docs/specs/theming-and-motion.md`).
- Add the `case` to `SectionRenderer`.

### 5. Close

Run the `docs-writer` agent in mode `sync` with the section's changed files and the decisions made along the way
(see `work-block`, last block of a feature).
