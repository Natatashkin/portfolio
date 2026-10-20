---
name: work-block
description: Run one work block in this portfolio repo from start to hand-off — implement a small, reviewable change, verify it (format, code-quality incl. circular dependencies, build), run the code-reviewer subagent, report changed files and findings, then stop for the author's approval. Use this for any code or docs change in this repo, whenever the author says "start block N", "do the next block", "fix these findings", or approves a plan, even if they don't mention blocks or review.
---

# Work block

A block is the unit the author reviews and commits, so it must be small enough to read in one sitting and must end
with a clear report, not with more work.

The rules (approval, git, deletions, secrets, dependencies, config) are the Working rules in `CLAUDE.md`; this skill
is only the procedure. Re-read those rules at the start of a block instead of relying on memory.

## Before writing anything

1. Find the spec. A feature change needs `docs/features/<name>.md`; if it is missing, the first block is the spec
   itself: run the `docs-writer` agent in mode `draft`. A new landing section follows the `new-section` skill.
2. Read `docs/conventions.md` and the `docs/specs/*` the change touches, then the code you will change. For Next.js
   code, check `app/node_modules/next/dist/docs/` first.
3. If the block depends on a decision only the author can make, ask first and change nothing that depends on the
   answer. Files that should be removed go into the report for the author.

## Doing the work

- Keep the block to one reviewable change. If it grows, stop at a natural boundary and propose the rest as the next
  block.
- When the plan changes during a block, record the decision in the block report (one line and the reason); the spec
  is updated from these at the end of the feature.
- Last block of a feature: run the `docs-writer` agent in mode `sync` with the feature's changed files and the
  decisions, then format and review its changes as part of this block.

## Verify

Report real output, never assume a check passed.

- **`app/` code:** `pnpm format` and `pnpm code-quality` in `app/` (lint, format check, types, madge).
- **GROQ in `queries.ts`:** `pnpm typegen` in `app/` before `code-quality` (stale types fail the type check).
- **Routes, data, config:** also `pnpm build` in `app/`.
- **`sanity-cms/` schemas:** `pnpm format` and `pnpm build` in `sanity-cms/`, then `pnpm typegen` in `app/`.
- **Visible or interactive UI:** the `ui-verify` skill (browser checks), on top of the checks above.
- **Docs only (`.md`):** Prettier on the changed files (below).

Docs Prettier: `cd sanity-cms && pnpm exec prettier --write <files>` for files inside `sanity-cms/` (its own config);
`cd app && pnpm exec prettier --write <files>` for everything else. The second only borrows the binary: files outside
`app/` (`CLAUDE.md`, `docs/`, `.claude/`) have no config of their own and get Prettier defaults.

## Review

Run the `code-reviewer` subagent with the list of changed files and a one-line block summary. Verify each finding
yourself before reporting it; fix nothing until the author approves.

## Report and stop

Reply in the author's language, short and scannable:

- **What changed:** files and why, grouped by purpose.
- **Checks run:** which commands passed; say plainly what was not run.
- **Reviewer findings:** confirmed vs. unconfirmed, most important first, each with a proposed fix.
- **Needs your decision:** open questions, files to delete.

Then stop. The next block starts only after the author explicitly approves.
