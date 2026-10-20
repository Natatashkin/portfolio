# CLAUDE.md

Bilingual (uk / en) portfolio landing of a **frontend developer**: Next.js 16, React 19, strict TypeScript, content in
Sanity. The repo is shown to employers, so code and docs stay clean and position the author as a frontend developer
only (nothing about selling, pricing, templates, client delivery or fullstack).

## Spec-driven workflow

Specs in `docs/` are the source of truth. Read the relevant spec before coding; change the spec first when behavior
changes. Index and workflow: `docs/README.md`. Decisions and their reasons: `docs/decisions.md`.
Project skills in `.claude/skills/` carry the procedures: `work-block`, `feature-spec`, `new-section`, `new-component`, `scroll-animation`, `ui-verify`, `docs-sync`.

## Repository

| Path          | What                                                          | Run                                 |
| ------------- | ------------------------------------------------------------- | ----------------------------------- |
| `app/`        | Next.js 16 (App Router), `src/`, alias `@/*` → `src/*`        | `cd app && pnpm dev / build / lint` |
| `sanity-cms/` | Sanity Studio v6, deployed separately (Vercel, output `dist`) | `cd sanity-cms && pnpm dev / build` |

Two independent packages with their own lockfiles (pnpm); no root workspace. Run commands inside the folder.

- Next.js 16 differs from older versions: read `app/AGENTS.md` and `app/node_modules/next/dist/docs/` before writing
  Next code. For Sanity (Studio v6, next-sanity, internationalized-array, TypeGen) check current docs, not memory.
- Types that mirror Sanity content come from TypeGen (`@/sanity.types`, `SectionOf` from `@/lib/sanity/types`), never hand-typed copies.
  Regenerate with `cd app && pnpm typegen`.

## Code rules

- TypeScript `strict`; no `any`, no non-null `!`. Prefer `type` imports.
- Server Components by default; `"use client"` only for small leaf components (interactivity, animation).
- One folder per component: `PascalCase.tsx`, `PascalCase.module.scss`, `index.ts` (re-export only, no `export *`,
  no folder-level barrels except `components/icons` and `lib/helpers`), optional `types.ts`. Import a component by its folder, never by the inner file.
- BEM inside SCSS Modules, camelCase (`styles.hero__stackItem`); tokens are CSS custom properties; no Tailwind;
  Montserrat is the only font.
- Handlers are named `handle<Thing>`; `useSyncExternalStore` subscribers `subscribeTo<Thing>`.
- All GROQ lives in `app/src/lib/sanity/queries.ts` via `defineQuery`; always pass `locale`; project only needed
  fields. Interface-only strings go to `app/messages/{uk,en}.json`; editable content stays in Sanity.
- Every CMS-provided href goes through `safeHref`. Never pass CMS data to `dangerouslySetInnerHTML`.
- Animation (Lenis + GSAP): client-only, one Lenis instance, `useGSAP` cleanup, animate `transform`/`opacity` only,
  honor `prefers-reduced-motion`.
- Details and rationale: `docs/conventions.md`.

## Out of scope

No state libraries, CSS frameworks, other CMS or database, case pages, external API integrations, plain `button`
block, or features outside `docs/specs/content-model.md`. No unneeded abstractions or tooling.

## Working rules

- Never run git commit, push, merge, rebase, reset, or create pull requests. The user does all git operations.
- Never delete files or directories, and never run commands that delete. Tell the user what to remove.
- New files are fine. Ask before overwriting or heavily rewriting an existing file.
- Work only inside this repository.
- Never read, print or edit `.env` files (use `.env.example` for names). No secrets in code or logs.
- Do not modify `.claude/settings.json` or `.claude/settings.local.json`.
- Ask before installing or removing dependencies, and before changing build, deploy or CI configuration.
- Work in small blocks (procedure: the `work-block` skill). After each block run its checks: code changes need
  `pnpm format` and `pnpm code-quality` in `app/`; docs-only blocks need only Prettier on the changed files. Then
  summarize changed files and why, say what to check, and wait for explicit approval before the next block.
- At the end of each block run the `code-reviewer` subagent on the changed files (one-line block summary) and include
  its findings in the summary. Do not fix findings until approved.
- Environment is Windows with Git Bash: use bash commands only.

## Sanity MCP

Reading (schemas, content, docs) is fine. Any write (create / patch / publish / delete documents, schema deploy,
dataset changes) only after asking and getting confirmation for that specific operation. Do not create content in the
dataset: the author fills it in Studio.
