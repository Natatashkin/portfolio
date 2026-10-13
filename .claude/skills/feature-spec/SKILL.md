---
name: feature-spec
description: Write or update a feature spec in docs/features/ for this portfolio repo — for a new feature before implementation, or retrospectively for code that already exists (Header, Footer, HeroSection, theming, i18n, smooth scroll...). Reads the actual code and Sanity schemas, fills docs/features/_template.md, records mismatches as Open questions, and updates docs/features/README.md. Use this whenever the author asks for a spec, requirements, acceptance criteria, "task" or documentation for a component, section or feature, or before starting any feature that has no spec yet.
---

# Feature spec

Specs drive the work: the author approves a spec before code is written, and the code reviewer checks code against
it. A spec that claims something the code does not do is worse than no spec, so every statement must be checked
against a source.

## Where things go

- `docs/features/_template.md`: the structure to fill. Copy it to `docs/features/<kebab-name>.md`.
- `docs/features/README.md`: index table. Add or update the row (Covers, Status, link to the spec).
- `docs/specs/content-model.md`: Sanity fields; link to it instead of copying field lists.
- `docs/conventions.md`: rules that apply to every component; link, don't repeat.

## New feature (before code)

Status `draft`. Write Goal, Requirements (unchecked `- [ ]`, each testable on its own), Design (schema, query and
cache tags, UI with server/client split, edge cases), Acceptance criteria, and Tasks split into small blocks. Put
every undecided point in Open questions and list it as a question for the author (an agent returns them in its
report; the main session asks directly); the spec becomes `approved` only after the author says so.

## Sync after implementation

Run when the last block of a feature is done (by the main session, usually through the `docs-writer` agent). Input:
the changed files and the decisions made while building.

1. Read the changed files and compare them with the spec, section by section.
2. Requirements: tick `- [x]` what the code does; rewrite requirements that changed by decision; move dropped ones to
   Decisions with the reason. Never leave a requirement that the code contradicts.
3. Design and Files: describe what was built, not what was planned.
4. Decisions: one line per change of plan, with the reason. A choice that affects other features also goes to
   `docs/decisions.md`.
5. Update what the feature touched: `docs/features/README.md` (status, Covers), `docs/specs/content-model.md`
   (schemas), `docs/roadmap.md`.
6. Status `done`. Anything still open stays in Open questions.

## Existing code (retrospective)

Status `done (documented after implementation)`. Be honest about this: the spec was written after the code.

1. Read every file of the feature: component, private children, `.module.scss`, hooks, the GROQ branch in
   `app/src/lib/sanity/queries.ts`, the schema in `sanity-cms/schemaTypes/`, strings in `app/messages/en.json`, and
   where it is used (`[locale]/layout.tsx`, `SectionRenderer`).
2. Requirements are checked `- [x]` only for behavior you saw in the code. Include what the code does that a reader
   would not guess: accessibility details, reduced-motion handling, breakpoints, what renders when data is empty.
3. List files in Files with one line each.
4. Open questions collect real mismatches: data fetched but never rendered, schema fields with no UI, behavior
   that breaks on another route, docs that disagree with code. Do not fix them in the spec; the author decides.

## Before finishing

- Re-read each claim and point to the line that backs it; drop or reword anything you cannot point to.
- Check links resolve (`docs/features/` → `../specs/...`, `../conventions.md#...`).
- The main session hands off through the `work-block` skill (Prettier, review, report, stop). The `docs-writer` agent
  returns its report and stops.
