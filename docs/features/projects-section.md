# Projects section

Status: done

## Goal

Show selected projects as cards in a grid: preview, title, Live and GitHub links, summary and tech stack. The visitor
sees what the author built and can jump to the live site, the code or the project's own page.

Design source: [../layouts/Projects.png](../layouts/Projects.png).

## Requirements

- [x] Renders `eyebrow`, `headline`, rich-text `description`, the `projects` cards in reference order and a closing
      `button` ("All Projects"). Every part is optional and leaves no empty wrapper. The section renders nothing
      without an intro and without cards.
- [x] A card needs a `title` and a `slug`; otherwise it is skipped. Dangling project references are dropped in the
      query.
- [x] Grid: one column at base, two from `md`, three from `lg`. Long words shrink instead of widening the page.
- [x] A card shows the preview, the title with its action buttons, the rich-text `summary` and a stack of `TagList`
      chips (text only; the block has no visible title). Without `technologies` the stack is not rendered.
- [x] Equal height and aligned dividers: cards of a row are equally tall (grid); the stack is pushed to the card
      bottom (`margin-top: auto`). From `md` the summary block is exactly four lines tall and the tags have the
      `min-height` of two chip rows, from the `--chip-height` token that `TagList` also uses (never clipped: a third
      row moves that card's divider). Below `md` the heights are natural.
- [x] Summary: at most four lines, cut with an ellipsis (`line-clamp`). The card sets `--richText-gap` and
      `--richText-item-gap` to 0, so paragraphs and list items do not push a line out of the clamp.
- [x] The card is not a link: the title, About, Live and GitHub are separate controls, so no interactive element
      nests in another.
- [x] The title (`h3`) is a locale-aware `Link` to `projects/<slug>` on every device (`safePath`; plain text when
      the path is unsafe). An accent underline grows from the centre in both directions (`underline-grow` mixin) on hover, only under
      `hover: hover`, and on `focus-visible`; there is no focus ring, the underline is the indicator (the outline stays
      transparent so forced-colors mode still draws it).
- [x] Live and GitHub come from the project's `buttons[]`. The kind is read from `iconKey === 'github'`, never from
      the array position: GitHub renders `outlined`, every other button `accent` (the CMS `variant` is overridden to
      match the design). They are always external links (`linkType` is forced, see Decisions), compact size, with an
      icon. A button without a label or a URL is not rendered.
- [x] About is an `outlined` `LinkButton` to the internal path `projects/<slug>`, label from `messages`
      (`ProjectsSection.about`). Its accessible name is `ProjectsSection.aboutProject` ("About: {title}"), so the
      links of different cards differ.
- [x] Preview: `ResponsiveImage` (desktop and mobile sources, localized alt, `sizes` mirroring the grid) in a fixed
      16:9 frame, so nothing shifts while it loads. A card without an image has no preview and no About button.
- [x] About overlay: a sibling of the picture, so the blur does not reach the button. It exists only under
      `hover: hover` and from `md` (768px): it is shown on `:hover` and `:focus-within` of the preview, the picture
      gets `blur(var(--blur))` and a darkening scrim; nothing is scaled or moved. The overlay is click-through
      except the button.
- [x] Below `md` or on touch there is no blur and no About button: the overlay is `display: none`, so it is neither
      focusable nor in the accessibility tree. The title is the link there.
- [x] The overlay sets `--color-text-muted` to `--color-on-photo`, so the outlined button is white on a photo in both
      themes.
- [x] Reduced motion: the picture and overlay transitions are removed.
- [x] Locales: every localized field falls back to `en` when the page locale is empty.
- [x] Semantics: card title is an `h3`; the cards are a `ul`.
- [x] `projects` is a cache tag of the page query, so editing a project revalidates the page.

## Design

- **Schema:** unchanged. `projectsSection` and `project` are in [../specs/content-model.md](../specs/content-model.md).
  `linkButton` has no per-type field, which is why Live vs GitHub is decided by `iconKey`.
- **Query:** `projectsSection` branch of `PAGE_QUERY` projects the localized `eyebrow`, `headline`, `description`, the
  dereferenced `projects` (`_id`, `slug`, localized `title`, `summary`, image `desktop`/`mobile`/`alt`,
  `technologies` as technology or skill, `buttons` with `_key`, `linkType`, `url`, `iconKey`, localized `label`) and
  `button`. `'project'` is in `PAGE_QUERY_TAGS`.
- **UI:** server components only, no client code and no animation. `ProjectsSection` (intro, grid, closing button) and
  the section-private `ProjectCard`. `SectionRenderer` has the `projectsSection` case. Shared parts: `Container`,
  `Headline`, `RichText`, `LinkButton`, `ResponsiveImage`, `TagList`, `toTagItems`. Strings: `ProjectsSection.about`
  and `ProjectsSection.aboutProject` in `messages/{uk,en}.json`. `LinkButton` gained `size` and `ariaLabel`, see [ui-blocks.md](ui-blocks.md).
- **Edge cases:** no buttons, no image, no technologies, no summary: each part is simply absent. Buttons keep their
  CMS order.

## Files

- `app/src/components/sections/ProjectsSection/ProjectsSection.tsx` and `.module.scss`: intro, grid, closing button.
- `app/src/components/sections/ProjectsSection/ProjectCard/`: card, preview overlay, action buttons, tech stack.
- `app/src/components/sections/ProjectsSection/types.ts`: `ProjectItem`, derived from the TypeGen section type, and
  `ProjectCardItem` (`title` and `slug` narrowed to `string` by the filter in `ProjectsSection`).
- `app/src/lib/sanity/queries.ts`: `projectsSection` branch and the `project` cache tag.
- `app/src/components/sections/SectionRenderer/SectionRenderer.tsx`: the case.
- `app/messages/{uk,en}.json`: `ProjectsSection` strings.

## Acceptance criteria

- [x] Renders in `en` and `uk`, desktop and mobile.
- [x] Hover blur, keyboard focus plus Enter on About, and reduced motion work; on touch there is no overlay and a
      tap on the title navigates.
- [x] Layouts at 1400, 1040, 800, 700 and 390 px hold.
- [ ] Light theme, `/en`, and the focus ring of About over the scrim in the light theme.
- [x] Empty or unexpected CMS data does not throw.
- [ ] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`; Studio builds.

## Decisions

- Live vs GitHub from `iconKey`, not a new schema field or array position: keeps the schema unchanged and does not
  break when an editor reorders buttons. Variants follow the design, so the CMS `variant` is ignored here.
- About sits in an overlay sibling of the picture: blurring the picture alone keeps the button sharp, and no
  transform keeps the image still.
- No blur and no About below `md` or on touch: a hover effect has no meaning there and a permanent button covered
  the preview. The title is the link on every device, so the details page stays reachable.
- The card is not a link, to avoid nested interactive elements.
- The blur is a `filter` transition, an exception to "transform and opacity only": [D25](../decisions.md).
- `ProjectCard` forces `linkType: external` on Live and GitHub: Studio defaults a new `linkButton` to `internal`,
  which would drop a full URL.
- The summary height is fixed from `md` and the tags have a `min-height` (not a fixed height): dividers line up in
  the common case, and a long tag list is never cut.

## Tasks

Done in the code.

## Open questions

- The route `/[locale]/projects/[slug]` does not exist (case pages are out of scope, see
  [../specs/product.md](../specs/product.md)), so the title and About land on the not-found page. Decided: leave it
  until the launch decision on the `projects/` stub routes (see [../roadmap.md](../roadmap.md)).
- `pnpm build` has not been run.
- The `uk` headline falls back to `en` in the current dataset; the author fills the `uk` value in Studio.
