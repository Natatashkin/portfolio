# Experience section

Status: done. Not yet checked: the Lenis one-frame trail with the pin (see the `scroll-animation` skill), JS disabled,
a failed GSAP import, a locale switch, an anchor visit to `#experience`, touch devices and iPad, a frame-by-frame flash
check.

## Goal

Show the work history as company cards on a vertical timeline, next to an intro with the CV downloads. The visitor sees
where the author worked, when, with which technologies and what was done there.

Design source: [../layouts/Experience-updated-2-layouts.png](../layouts/Experience-updated-2-layouts.png) (desktop
left, mobile right).

## Requirements

- [x] Renders `eyebrow`, `headline`, rich-text `description`, `buttons` (CV downloads EN and UK, see [ui-blocks.md](ui-blocks.md)) and
      `experiences` in reference order. Every part is optional and leaves no empty wrapper. Intro without cards or
      cards without intro is one column; neither renders nothing. A company without a name is skipped.
- [x] Layout: from `lg` two columns (intro left, cards right), below `lg` one column (intro, then cards).
- [x] A card row is date | rail with marker | card. The date shows month and year in the page locale in
      `<time datetime>`, start in the accent colour and end in the text colour; an empty `periodEnd` shows the
      `present` message.
- [x] The card shows the logo tile, company name, role, `companyDescription`, then one nested entry per `entries[]`
      item. An entry without a title is skipped.
- [x] An entry shows its title, its own `technologies` as `TagList` chips (text only, `iconKey` ignored) between title
      and description, and the bulleted `description`. The company has no tags of its own.
- [x] Logo: `next/image` with `width` and `height` from asset metadata in the query, inside a fixed-size tile; without
      metadata it fills the tile (`fill`). SVG is not optimized. The image is decorative (`alt=""`): the company name
      is in the adjacent `h3`.
- [x] Entry body: from `lg` always open, the toggle is `display: none`. Below `lg` it starts collapsed (`display: none`
      keyed on `data-open="false"`) and the whole row toggles; tags sit in the body, so they are hidden with the
      description. Without JS (`scripting: none`) the body is open and the toggle hidden. An entry with no body has no
      toggle and no dot.
- [x] Toggle semantics: the title is an `h4` outside the `<button>`; the button has `aria-expanded`, `aria-controls`
      and `aria-labelledby` (title and count). The count is a visible number (`aria-hidden`) plus visually hidden ICU
      plural text; it is omitted for 0. The count is the bullet items, or all blocks when there are no bullets.
- [x] Semantics: section headline, company `h3`, entry `h4`; the cards are an ordered list with an `aria-label` from
      `messages`; the rail and marker are `aria-hidden`.
- [x] Reveal: each card wrapper (`[data-reveal]`: date, marker, card) rises 48px and fades in once (0.8s `power3.out`)
      when a third of the card (at most a third of the viewport) is visible. Only a card wholly below the screen at
      load is hidden; a partly visible or passed card stays as drawn and revealed cards stay revealed. After a row
      toggle below `lg`, `ScrollTrigger.refresh()` runs only while cards are pending. The intro, buttons and timeline
      line are not animated.
- [x] Pin: from `lg`, with no reduced motion and a viewport at least `40rem` tall (`INTRO_PIN_QUERY`), the left intro
      column is held (not animated) while the cards scroll past and released when the row ends; the right column is
      not pinned. It is skipped when the intro plus its offset does not fit the viewport or the row is not taller than
      the intro, and re-evaluated after a window resize (`RESIZE_REFRESH_DELAY_MS`).
- [x] Reduced motion: GSAP is not loaded, everything is visible and static. A failed import is ignored; setup
      errors surface. Cleanup kills triggers and tweens and clears inline styles.
- [x] A dangling reference is dropped; an empty `uk` value falls back to `en` in GROQ (D3).
- [x] No new dependencies; shared blocks `Container`, `Headline`, `RichText`, `LinkButton`, `TagList` and TypeGen types.

## Design

- **Schema:** [../specs/content-model.md](../specs/content-model.md). `experienceSection`: `eyebrow`, `headline`,
  `description`, `experiences[]`, `buttons[]` (`linkButton`, group `actions`), `anchorId`. `experience` has a plain
  `logo` image.
- **Query:** `experienceSection` branch of `PAGE_QUERY`: `experiences[defined(@->_id)]->` with logo `url`, `width`,
  `height` from `asset->metadata.dimensions`, localized texts, entries with `technologies[defined(@->_id)]->`;
  `buttons[]` with resolved `fileUrl` and `fileName`. Cache tag `experience`.
- **UI:** the section is a Server Component with private children, each in its own folder: `ExperienceIntro` (client,
  owns the pin), `ExperienceTimeline` (client, the `<ol>` around server-rendered cards, owns the reveal),
  `ExperienceCard` (server: date, rail, card, logo, entries), `ExperienceEntry` (client: toggle state, title, button,
  body). Types: `types.ts` (`ExperienceItem`).
- **Entry state:** CSS and `data-open` only, no `useIsMobile` (see Decisions). The body has no `hidden`, `aria-hidden` or
  `inert`; below `lg` the toggle's `::after` covers the header row.
- **Motion:** both run under `gsap.matchMedia`. The reveal trigger is on the never-transformed `li`, with `start`
  capped at `maxScroll - 1`. The pin trigger is on the grid row (`pinSpacing: false`, `anticipatePin: 1`); the intro's
  class carries no `grid-area` or margins, because GSAP's spacer copies the element's box.
- **Helpers** (`lib/helpers`): `formatMonth` (UTC, no dots, capitalised), `countRichTextItems`, `toTagItems`.
- **Shared changes:** `ui/TagList` (promoted from the hero chips), `DownloadIcon` in `LinkButton`, and `RichText` web
  links open in a new tab with a visually hidden hint (`RichText.opensInNewTab`).
- **Messages:** `ExperienceSection.timeline`, `present`, `items` (ICU plural; `uk` has one/few/many/other).
- **Edge cases:** no logo renders no tile; no entries renders no list; a null `entries` from GROQ is empty.

## Files

- `sanity-cms/schemaTypes/sections/experienceSection.ts`, `documents/experience.ts`.
- `app/src/lib/sanity/queries.ts`, `app/src/lib/constants.ts` (`INTRO_PIN_QUERY`, `RESIZE_REFRESH_DELAY_MS` = 150ms),
  `app/src/lib/motion/loadGsap.ts`.
- `app/src/components/sections/ExperienceSection/`: section, `types.ts`, `ExperienceIntro/` (`ExperienceIntro.tsx`
  holds `PIN_OFFSET` = 96px), `ExperienceTimeline/`, `ExperienceCard/`, `ExperienceEntry/`.
- `app/src/components/ui/{TagList,LinkButton,RichText}/`, `components/icons/` (`ChevronIcon`, `DownloadIcon`).
- `app/src/lib/helpers/` (`dateFormatters.ts`, `richText.ts`, `tags.ts`), `app/messages/{en,uk}.json`.

## Acceptance criteria

- [x] Renders in `en` and `uk`, desktop and mobile; light and dark checked.
- [x] The mobile toggle works; on desktop the description is open and no toggle is displayed.
- [x] Cards reveal at about a third visible; the intro and buttons are static.
- [x] The intro pins and releases at the end of the cards; no pin below `lg` or under reduced motion; in a
      production build the GSAP and ScrollTrigger files are not downloaded under reduced motion.
- [x] Console is clean.
- [ ] No visible Lenis trail on the pinned intro (one-frame check).
- [ ] JS disabled, a failed GSAP import, a locale switch and an anchor visit to `#experience` behave.
- [ ] Touch and iPad-size screens; no flash frame by frame.
- [x] `pnpm format`, `pnpm code-quality` and `pnpm build` pass in `app/`; Studio builds.

## Decisions

- Pin the left intro (ScrollTrigger `pin`, no spacing, nothing animated); the cards scroll normally. Rejected: pinning
  the cards column with a scrubbed track; the transformed track moves focused elements out of view and breaks
  find-in-page.
- Responsive entry state in CSS (a media query and `data-open`), not `useIsMobile`: it is `null` on the server, so
  desktop would flash a wrong state, and CSS also works without JS.
- Logo size comes from asset metadata, never the asset ref.
- `ignoreMobileResize` is global in `loadGsap`: address-bar resizes would make the pin jump.
- The pin offset, minimum height and resize delay are provisional, kept until seen on real screens.

## Tasks

Done in the code.

## Open questions

- Check the Lenis trail with the pin and, if visible, record a decision (D10).
