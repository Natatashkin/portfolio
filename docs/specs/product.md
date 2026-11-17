# Product spec

## Goal

A multipage site (a landing and a projects list page) that presents a frontend developer to employers and shows, through the repository itself:
code quality, strict TypeScript, sound architecture, polished UI and animation.

## Audience

Hiring managers and engineers who read both the live site and the source.

## Scope

- The landing (`home`) assembled from reusable section blocks managed in Sanity.
- Two languages: English (default, `/`) and Ukrainian (`/uk`), with a language switcher; hreflang alternates are required before launch (Page metadata and SEO).
- Light and dark themes; default follows the system, manual override is remembered.
- Smooth scrolling and scroll-driven animation that respects reduced-motion.
- Header navigation, footer, 404 page.
- A projects list page at `/projects` with a technology filter (planned: [../features/projects-page.md](../features/projects-page.md)).

## Non-goals

- Anything about selling, pricing, billing, templates, client delivery; no fullstack positioning.
- Project details pages (`projects/[slug]`) and case pages (the `cases/` route is a temporary placeholder, replaced or
  removed before launch), external API integrations, state libraries, CSS frameworks, a second CMS or a database.
- A plain `button` block. Features outside [content-model.md](content-model.md).

## Quality bar

- TypeScript `strict`, no `any`. ESLint and Prettier clean.
- Static rendering with tag revalidation; no client fetching for content.
- Accessible: semantic landmarks, skip link, focus states, aria-labels, keyboard use, reduced motion.
- Content never hard-coded in components; interface-only strings live in `app/messages/`.
- Repo stays presentable: clean READMEs, no dead code, comments explain why.
