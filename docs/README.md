# Documentation

Spec-driven development (SDD): a spec describes the behavior first, code follows it, and the spec is updated in the
same change when behavior moves.

## AI workflow

This project is built with an AI coding agent (Claude Code) under explicit control:

1. **Spec first.** Behavior is written down in [features/](features/) and [specs/](specs/); the agent reads the spec and `CLAUDE.md` before coding.
2. **Approval.** The author approves the spec and each block before the next one starts.
3. **Small blocks.** One block is one reviewable change; the agent summarizes what changed and what to check.
4. **Subagent review.** A custom `code-reviewer` agent (`.claude/agents/`) checks every block against the specs; its
   findings are fixed only after the author approves them.
5. **Author owns git.** Commits, pushes and merges are done by the author; the agent never deletes files or touches
   secrets, and asks before dependency, build or deploy changes.

Roles: the main session coordinates and writes code; the `docs-writer` subagent (`.claude/agents/`) drafts each
feature spec from the task and syncs it with the code when the feature is done; the `code-reviewer` subagent checks
every block. The steps are encoded as project
skills in `.claude/skills/`: `work-block` (one block from change to hand-off),
`feature-spec` (write or update a spec in `features/`), `new-section` (a landing section end to end),
`new-component` (folder, styles, strings, checks), `scroll-animation` (Lenis + GSAP motion) and `docs-sync` (audit docs against code).

## Index

| Document                                                   | Answers                                         |
| ---------------------------------------------------------- | ----------------------------------------------- |
| [features/](features/README.md)                            | Feature specs with status, one file per feature |
| [specs/product.md](specs/product.md)                       | What the site is, for whom, scope and non-goals |
| [specs/architecture.md](specs/architecture.md)             | Stack, structure, rendering, i18n, data flow    |
| [specs/content-model.md](specs/content-model.md)           | Sanity schemas: blocks, documents, sections     |
| [specs/theming-and-motion.md](specs/theming-and-motion.md) | Themes, tokens, Lenis + GSAP rules              |
| [conventions.md](conventions.md)                           | Code style, naming, folders, SCSS, sections     |
| [decisions.md](decisions.md)                               | Decision log (ADR-style) with reasons           |
| [roadmap.md](roadmap.md)                                   | Status, next steps, known issues                |

## Workflow

1. **Specify.** The author sets the task; `docs-writer` (mode `draft`) writes `features/<name>.md` from
   [features/\_template.md](features/_template.md) and adds it to `features/README.md`.
2. **Agree.** The author reviews the spec and answers its open questions; it becomes `approved`.
3. **Implement.** Small blocks following the spec and [conventions.md](conventions.md) (schema first, then query and
   TypeGen, then component). A change of plan is recorded as a decision in the block report.
4. **Verify.** Every block: the checks from the `work-block` skill and a `code-reviewer` run.
5. **Sync.** After the last block, `docs-writer` (mode `sync`) updates the spec to what was built, including the
   decisions; the author reviews it and the feature is `done`.

`specs/` holds cross-cutting documents that change rarely; `features/` holds one spec per feature.
