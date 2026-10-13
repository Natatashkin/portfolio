---
name: docs-sync
description: Audit this portfolio repo's documentation against the real code and report drift — claims in CLAUDE.md, docs/, READMEs and .claude/agents that no longer match schemas, queries, components, scripts, routes or config; broken links; feature specs with stale requirements. Use this whenever the author asks whether docs are up to date, after a refactor or rename, before launch, before showing the repo to someone, or says things like "check the docs", "sync documentation", "is CLAUDE.md still right".
---

# Docs sync

Docs here are read by the agent as instructions and by employers as evidence of process, so a wrong claim does
real damage twice. The job is to find drift and report it, then fix only what the author approves.

## Scope

`CLAUDE.md`, `docs/**/*.md`, `app/README.md`, `sanity-cms/README.md`, `.claude/agents/*.md`, `.claude/skills/*/SKILL.md`
(project skills only, not the symlinked third-party ones). Skip `node_modules` and `.env*`.

## Check against sources

| Claim type           | Source of truth                                                             |
| -------------------- | --------------------------------------------------------------------------- |
| Sanity fields, rules | `sanity-cms/schemaTypes/**`                                                 |
| Queries, cache tags  | `app/src/lib/sanity/queries.ts`, `lib/sanity/api/*`                         |
| Components, behavior | `app/src/components/**` (incl. `.module.scss`), `hooks/`                    |
| Routes, i18n         | `app/src/app/**`, `app/src/i18n/*`, `app/src/proxy.ts`, `app/messages/*`    |
| Scripts, commands    | `scripts` in both `package.json` files, `app/scripts/*`                     |
| Config, env names    | `next.config.ts`, `pnpm-workspace.yaml`, `.env.example` names (if readable) |
| Feature status       | `docs/features/README.md` vs. what exists in code                           |

Also check: every relative link resolves; no doc still points at a file that was moved or removed; the same fact is
not stated differently in two places (prefer one home and a link).

## Report

Group findings as:

- **Confirmed drift:** doc says X, code says Y, with `file:line` for both and a proposed fix (docs or code).
- **Needs a decision:** cases where either side could be right; ask the author which behavior is intended.
- **Unverified:** claims you could not check (for example env files you may not read).

Then stop and ask which fixes to apply. When applying, change docs and code together in one block through the
`work-block` skill, and never rewrite a doc wholesale when a line edit will do.
