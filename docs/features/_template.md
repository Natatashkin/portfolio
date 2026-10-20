# <Feature name>

Status: draft | approved | in progress | done | done (documented after implementation)

## Goal

One or two sentences: what the visitor or the author gets.

## Requirements

- [ ] Functional requirement, testable on its own.
- [ ] Content requirement (which Sanity fields, which locales).
- [ ] Non-functional (accessibility, reduced motion, themes, performance).

## Design

- **Schema:** types/fields added or changed in `sanity-cms/schemaTypes/`.
- **Query:** GROQ branch in `app/src/lib/sanity/queries.ts`, cache tags.
- **UI:** components and folders, server vs client split, tokens used.
- **Edge cases:** empty/missing data, unknown keys, long text, one locale empty.

## Files

- `app/src/...`: what lives there.

## Acceptance criteria

- [ ] Renders in `en` and `uk`, light and dark, mobile and desktop.
- [ ] Empty or unexpected CMS data does not throw.
- [ ] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`; Studio builds.

## Decisions

Optional. One line per choice or change of plan, with the reason. A choice that affects other features also goes to
[../decisions.md](../decisions.md).

## Tasks

<!-- Small blocks while in progress; after the feature is done replace with "Done in the code". -->

1. Block 1: …
2. Block 2: …

## Open questions

- …
