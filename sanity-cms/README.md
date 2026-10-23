# Portfolio: Sanity Studio

Content studio (Sanity Studio v6) for the portfolio landing. Content is localized per field (`en`, `uk`) with
`sanity-plugin-internationalized-array`.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3333
pnpm build      # output in dist/
```

## Scripts

| Command             | What it does                                                |
| ------------------- | ----------------------------------------------------------- |
| `pnpm dev`          | Run the Studio locally                                      |
| `pnpm build`        | Build the Studio                                            |
| `pnpm start`        | Serve the built Studio                                      |
| `pnpm deploy`       | Deploy the Studio with the Sanity CLI                       |
| `pnpm format`       | Prettier (write)                                            |
| `pnpm format:check` | Prettier (check only)                                       |
| `pnpm typegen`      | Extract the schema and generate types (consumed by the app) |

## Structure

```
schemaTypes/blocks/      linkButton, responsiveImage, richText, headline
schemaTypes/documents/   page, siteSettings, project, experience, skill, piece, road, metric, technology
schemaTypes/sections/    one object type per landing section
schemaTypes/lib/         languages, constants, localized-field helpers, shared section groups
schemaTypes/lib/helpers/ small pure helpers, one per file, re-exported by index.ts (formatDate)
structure.ts             desk structure (siteSettings singleton)
static/sections/         insert-menu tile images
```

The content model is described in [`../docs/specs/content-model.md`](../docs/specs/content-model.md). Changing a
schema means updating that spec and running `pnpm typegen` in `../app`.
