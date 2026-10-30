# Experience section

Status: draft

## Goal

Show the author's work history as company cards on a vertical timeline, next to an intro with two CV downloads. The
visitor sees where the author worked, when, with which technologies and what was done there.

Design source: [../layouts/Experience-updated-2-layouts.png](../layouts/Experience-updated-2-layouts.png) (desktop left,
mobile right). The older `Experience.png` and `Erperience-mobile.png` are superseded. The layout is new; it does not
reuse the Career layout. The `ExperienceSection` component is built from scratch.

## Requirements

- [ ] Renders `eyebrow`, `headline`, rich-text `description`, `buttons` (CV downloads EN and UK, D15) and
      `experiences` (company cards, in the order of the references). Every field is optional; a missing one renders
      nothing, never an empty wrapper. No `experiences`: neither the container nor the grid column is rendered, the
      intro alone is a single column.
- [ ] A company card shows: logo, company name, date range, role label (on all screen sizes), `companyDescription`,
      technology tags, then one nested card per entry (`title`, bulleted `description`, its technologies). Entries are
      not flattened into one list.
- [ ] Dates: `periodStart` and `periodEnd` as month and year in the page locale, in `<time datetime>`; an empty
      `periodEnd` renders the `messages` key `present` ("Present" in `en`, "До тепер" in `uk`).
- [ ] Tags: the technologies and skills of all entries of a company, deduplicated by the referenced `_id`, in order of
      first appearance. Text only (`name` / `title`); `iconKey` is ignored.
- [ ] Desktop (`lg` up): left column with the eyebrow, headline, description and CV buttons; right column with the
      cards on a vertical line. Each card has a marker on the line and the date range beside it (start on the first
      line, end on the second). Company info on top, tags below, then the entry cards with title and bullet
      description visible.
- [ ] Desktop pin (`lg` up, viewport height at least the provisional minimum, no reduced motion): the left column
      scrolls with the page (no `position: sticky`, no pin). The right column is a viewport-height container pinned
      with GSAP ScrollTrigger `pin` (not CSS sticky) while an inner track holding all cards is moved up by a scrubbed
      `transform` tween, so every card passes through the viewport. The pin ends when the last card has reached the
      container bottom (with the track's bottom padding above it). The intro and buttons are not animated.
- [ ] Normal flow, no pin, no translate, all cards visible and nothing clipped: below `lg`, on a short viewport, under
      reduced motion, without JS, when GSAP fails to load, and when the track is not taller than the container. The
      container's fixed height and clip apply only while the pin is active (`data-pinned`), never from the base CSS.
- [ ] Layout stays in sync with the pin: the pin is refreshed when the track resizes (ignoring size changes the pin
      itself causes), when web fonts are ready, and on load/resize (ScrollTrigger's own). The logo has explicit
      `width` and `height` from Sanity asset metadata (see Design, Logo).
- [ ] Layout shift when the pin applies: wherever the section is already in view while GSAP loads (anchor visit to
      `#experience`, scroll-restored reload), the scroll position is restored so the content does not jump.
- [ ] Keyboard and assistive tech on desktop: cards moved out of the pinned viewport stay in the accessibility tree and
      tab order. Keyboard focus (`:focus-visible`, not pointer-initiated) on an element outside the container's
      visible rect scrolls the page so that element lands inside the container, and reveals its card if still pending.
      Before the pin starts, focus changes do nothing.
- [ ] Mobile (below `lg`): eyebrow, headline, description, CV buttons below the description, then the timeline. Company
      info, role label and tags are visible. Each entry is a compact row (title, count of description items,
      chevron); a click or Enter/Space on the row toggles its description. Rows start collapsed.
- [ ] One entry component for both layouts. The entry title is a heading outside the toggle button and stays visible
      at all sizes. The toggle is a real `<button>` that spans the row below `lg` and contains the visible count and
      chevron; its accessible name comes from the visible title and count text (`aria-labelledby` to those elements,
      no `aria-label` that replaces visible text; label in name, WCAG 2.5.3). It has `aria-expanded` and
      `aria-controls` pointing at the description, kept in sync with the state; the focus ring is visible.
- [ ] Desktop accessibility of entries: from `lg` up the description is always visible and fully exposed to screen
      readers; the disclosure logic never puts `hidden`, `aria-hidden`, `inert` or `display: none` on it there. Only
      the toggle control (and the count inside it) is `display: none` from `lg`, so it is out of the accessibility
      tree and tab order and `aria-expanded` is not exposed; the title heading stays.
- [ ] Below `lg` a collapsed description uses only `display: none`, or `grid-template-rows: 0fr` together with
      `visibility: hidden`; never `0fr` alone (the text would stay in the accessibility tree and tab order).
- [ ] Count of description items: blocks with `listItem: "bullet"`; if there are none, all blocks.
- [ ] Semantics: the section headline keeps its level; company name is one level below it, entry title one level below
      the company name. Entry descriptions are lists (bullet portable text); tags are a list; the cards are an ordered
      list with an `aria-label` from `messages`; markers are `aria-hidden`; the logo is decorative (`alt=""`, the
      company name sits next to it).
- [ ] Reveal (GSAP, once): only the company cards, each together with its marker and date label, rise from the bottom
      and fade in when about a third of the card is visible, capped at a third of the viewport height so a tall card
      still reveals; every next card the same. Holds in normal flow and for cards arriving through the pinned track.
      The intro, the CV buttons and the line are not animated. A card whose trigger is already reached or passed is
      never hidden.
- [ ] After a row toggle (below `lg` only, where there is no pin) `ScrollTrigger.refresh()` runs only while cards are
      still waiting to reveal. No layout jump, flicker or jerky animation.
- [ ] Cleanup: ScrollTriggers, the matchMedia context, tweens, listeners, timers and `data-pinned` are removed on
      unmount and when a query stops matching; inline `opacity`/`transform` are cleared; `ScrollTrigger.refresh()`
      runs after `data-pinned` is removed so other triggers on the page are not stale. Revealed cards stay revealed
      after a revert and re-run (no re-hide).
- [ ] Without JS and under `prefers-reduced-motion` everything is visible and static; no GSAP chunk loads under
      reduced motion (D18). Without JS, descriptions are expanded and the toggle buttons are hidden
      (`@media (scripting: none)`); before hydration the buttons are inert (accepted). A runtime change of reduced
      motion does not re-run the effect (accepted).
- [ ] A dangling reference (company, technology, skill) is dropped; an empty `uk` value falls back to `en` in GROQ (D3).
- [ ] No new dependencies; existing UI blocks (`Container`, `Headline`, `RichText`, `LinkButton`) and TypeGen types.

## Design

- **Provisional values (one place, confirm in the browser, then record in Decisions):** pin only at viewport height
  `>= 40rem`, otherwise normal flow; resize-observer debounce proposed `150ms`; reveal fraction one third of the card,
  capped at one third of the viewport height; container inline padding and track vertical padding start at `1.5rem`
  (24px), adjusted only if the design needs it.
- **Schema:** [../specs/content-model.md](../specs/content-model.md) is updated in the sync block.
  - `experienceSection`: `eyebrow`, `headline`, `description` (group `content`), `experiences[]` → experience,
    `buttons[]` (linkButton, group `actions`, replaces the single `button`), `anchorId` (group `settings`, anchor id
    for the "experience" section, `^[a-z0-9-]+$`).
  - `experience`: new `logo` (plain `image`, no alt field, pre-sized by the author, no responsive variants); the rest
    as is (`company`, `role`, `periodStart`, `periodEnd`, `companyDescription`, `entries[]` {`title`,
    `technologies[]` → technology \| skill, `description`}).
  - Old `experienceSection.button` data is re-entered in Studio by hand; no migration script.
- **Query:** new `experienceSection` branch in `PAGE_QUERY` (`app/src/lib/sanity/queries.ts`), `locale` always passed,
  `en` fallback. Projection: `experiences[defined(@->_id)]->` with `logo` (asset url and `asset->metadata.dimensions`
  width and height), localized `company`, `role`, `companyDescription`, `periodStart`, `periodEnd`, and `entries[]`
  with `_key`, localized `title` and `description`, `technologies[defined(@->_id)]->` (`_id`, `name` for technology or
  localized `title` for skill). `buttons[]` with `_key`, resolving the download `fileUrl` and `fileName` (D15). `experience` joins `PAGE_QUERY_TAGS`; the revalidate route builds its known tags from that list, so it
  needs no change.
- **Logo:** `next/image` with explicit `width` and `height` from the projected metadata, `alt=""`; dimensions are never
  parsed from the asset ref. If metadata is missing, the logo sits in a fixed-size tile (size from a design token) and
  the image uses `object-fit: contain`, so there is no layout shift.
- **UI:** `app/src/components/sections/ExperienceSection/`, a Server Component that renders the two-column grid; a
  `SectionRenderer` case. Private children, each in its own folder:
  - `ExperienceTimeline/` (client leaf, create it; the empty dir is untracked): renders only the right column
    (`container` > `track` > `<ol>`) around server-rendered card children; owns the refs, the pin and the reveal. The
    section puts the intro in the left column and omits the right column when there are no experiences.
  - `ExperienceEntry/` (client leaf): toggle state, heading, button, description.
  - Date helper and tag deduplication: pure functions in the `ExperienceSection` folder (a file next to the
    component, not in `lib/helpers`).
- **Entry toggle:** CSS and state only, no `useIsMobile` (it is `null` on the server, so desktop would flash a wrong
  state). Server and client render the same state, so there is no hydration flash. The description is a plain element
  with no `hidden`, `aria-hidden` or `inert`. The collapsed look is applied only inside a below-`lg` media query, keyed
  on `data-open="false"` set by the entry; at `lg` and up no rule collapses it. Markup: heading with the title, and a
  button stretched over the row below `lg` with the count and chevron, named by `aria-labelledby` (title and count
  ids). The button and the count are `display: none` from `lg`, and `display: none` under `@media (scripting: none)`.
- **Pinned scrub (desktop):** markup is `container` > `track` (`display: flow-root`, so child margins stay inside) >
  the `<ol>`. The base CSS gives the container no height and no clip. `[data-pinned]` sets `height: 100svh` and
  `overflow: clip` (not `hidden`, so the browser cannot scroll it on focus). Padding: the container has inline padding;
  the track has the vertical padding, so the track's `offsetHeight` includes it and `getDistance()` stays right.
  Padding leaves room for the 2px focus ring, borders and shadows and for space above the first and below the last
  card; `overflow-clip-margin` is not used (support not verified).
  - **Order in the matchMedia handler:** remember the scroll position, set `data-pinned`, force layout, measure
    `getDistance()` (track `offsetHeight` minus container `clientHeight`). If `<= 0`, remove the attribute and return.
    Otherwise create the pin and the tween, call `ScrollTrigger.refresh()` and restore the saved scroll position
    (`lenis.scrollTo(y, { immediate: true })` or `window.scrollTo`). Cleanup removes `data-pinned`. A failed GSAP
    import (`.catch`) never sets it and leaves the normal flow.
  - One `ScrollTrigger` pins the container (`start: "top top"`, the header is absolute, not fixed) and scrubs a single
    `gsap.to(track, { y: () => -getDistance(), ease: "none" })`. Settings: `end: () => "+=" + getDistance()`,
    `pinSpacing: true`, `invalidateOnRefresh: true` (re-evaluates both functions), `anticipatePin: 1`,
    `scrub: true` (Lenis already smooths). Only `transform` moves. The left column sits in the same grid row and
    scrolls away normally.
  - The default pin on the `<body>` scroller uses `position: fixed`, which breaks inside an ancestor with `transform`,
    `filter`, `will-change` or `contain`: the section's ancestors have none. The pin-spacer sits in the grid cell; the
    left column keeps `align-self: start` and the cell keeps its grid placement.
- **matchMedia structure** (`gsap.matchMedia`, one context, cleaned up on unmount; reduced motion loads no GSAP):
  - `mm.add` (i), pin condition: `DESKTOP_QUERY` + `NO_REDUCED_MOTION_QUERY` + a height condition from a new constant
    in `lib/constants.ts`. Creates the pin, the scrub, the `focusin` listener, the `ResizeObserver` and the
    pinned-track reveal.
  - `mm.add` (ii), normal-flow reveal: no-reduced-motion and not (i) (below `lg`, short desktop viewports); no pin.
    Reuses the [scroll-animation skill](../../.claude/skills/scroll-animation/SKILL.md) traps: a function `start`
    capped at `ScrollTrigger.maxScroll(window) - 1`; hide a card only if its trigger has not been reached (progress
    0; already past is left alone); tweens started from `onEnter`/`onUpdate` are not owned by `mm`, so cleanup kills
    them and clears inline opacity and transform. A flag/ref keeps revealed cards revealed
    when a query flips and the handler re-runs.
- **Refresh:** all inside the (i) handler. A `ResizeObserver` on the track calls a debounced `ScrollTrigger.refresh()`;
  it ignores size changes the pin itself causes (compare the track's own height with the last measured one). The
  debounce timer is cleared and the observer disconnected on cleanup. `document.fonts.ready` triggers one refresh,
  guarded by an `ignore` flag set on cleanup. After the revert removes `data-pinned`, `ScrollTrigger.refresh()` runs.
  Entry toggles never affect the pinned layout (no toggles on desktop, no pin below `lg`).
  `ScrollTrigger.config({ ignoreMobileResize: true })` is global, set once in `lib/motion/loadGsap.ts`.
- **Layout shift, anchors, restoration:** setting `data-pinned` changes the layout once. Below the fold it is not
  noticeable; for an anchor visit to `#experience` or a scroll-restored reload the section is already in view while
  GSAP loads, so the handler restores the saved scroll position after `refresh()` (see order above). Without JS
  nothing shifts.
- **Reveal inside the pin:** one mechanism, no `containerAnimation`. The pinned trigger's `onUpdate` and `onRefresh`
  check each pending card's outer `<li>` (never animated) with `getBoundingClientRect()`; when its top is above
  `viewportHeight - min(cardHeight, viewportHeight) / 3`, the inner wrapper (card, marker, date label) plays a
  once-only `y` and `opacity` tween and the card leaves the pending list. The same check runs from a plain
  `ScrollTrigger` over the container before the pin starts. The tween is separate from the track's `y` (nested
  transforms). Rejected: `containerAnimation` per card (unreliable for cards before the scrub range) and tweens inside
  the scrub timeline (reverse on scroll back, offsets recomputed on every refresh).
- **Focus, find-in-page, anchors:** off-screen cards remain in the accessibility tree and tab order. A `focusin`
  listener on the track acts only for keyboard focus (`:focus-visible`), only when the element is not already inside
  the container's visible rect, and only once the pin is active. `delta` is the difference of
  `getBoundingClientRect().top` between the focused element's never-animated `<li>` and the track (no container
  padding term; the track carries the padding). When the card is taller than the container, the focused element itself
  is measured. Not `offsetTop` (offsetParent dependent). The mapping is 1:1 because `end = start + distance`:
  `scrollY = trigger.start + clamp(delta, 0, distance)`. The scroll uses Lenis read through a ref (`useLenis()` from
  `lenis/react` returns `undefined` at first and must not be an effect dependency), `lenis.scrollTo(y, { immediate:
true })`, falling back to `window.scrollTo`, and reveals the card at once. The browser's own focus-scroll runs first
  and the handler overrides it.
  - Limitation: screen-reader browse-mode cursor movement and find-in-page do not fire `focusin`, so a match in a card
    outside the pinned viewport is found but not shown. Anchor links reach the section by `anchorId` only.
  - Alternative, not adopted: container `overflow: hidden` driven by `scrollTop` with a two-way `scroll` sync. It fixes
    find-in-page but gives up transform-only animation.
- **Messages** (`messages/{en,uk}.json`): `present`; the card-list `aria-label`; the entry count label as an ICU plural
  (`en`: one/other; `uk`: one/few/many/other). Entry toggle state is exposed by `aria-expanded` and the visible text,
  so there are no separate expand/collapse labels.
- **Edge cases:** a card taller than the container is traversed like any other but cannot be fully in view at once;
  `periodStart` is required; a company with no entries or no technologies renders no entry list or tag row; no logo
  renders no logo tile; one `uk` value empty falls back to `en`; `buttons` that all render nothing leave no empty
  wrapper.

## Files

- `sanity-cms/schemaTypes/sections/experienceSection.ts`, `documents/experience.ts`.
- `sanity-cms/static/sections/experienceSection.svg` (exists; check it fits the new section).
- `app/src/lib/sanity/queries.ts`, `app/src/sanity.types.ts` (generated).
- `app/src/lib/constants.ts` (new height query constant), `app/src/lib/motion/loadGsap.ts` (`ignoreMobileResize`).
- `app/src/components/sections/ExperienceSection/` (component, `.module.scss`, `index.ts`, date and tag helper files)
  with `ExperienceTimeline/` and `ExperienceEntry/` (each: component, `.module.scss`, `index.ts`, `types.ts` if needed).
- `app/src/components/sections/SectionRenderer/SectionRenderer.tsx`.
- `app/messages/en.json`, `uk.json`.
- At sync: `.claude/skills/scroll-animation/SKILL.md`, `docs/features/smooth-scroll.md`, `docs/decisions.md` (D10 and new
  entries), `docs/specs/content-model.md`, README, roadmap.

## Acceptance criteria

- [ ] Renders in `en` and `uk`, light and dark, mobile and desktop, matching the layout image.
- [ ] Empty or unexpected CMS data does not throw; no `experiences` renders no container and no grid column.
- [ ] The timeline reveals each card with its marker at about one third visible; the intro and buttons are static.
- [ ] Desktop: the intro scrolls away normally; the card container is pinned while the track moves up, every card
      passes through the viewport and the pin releases when the last card is reached. Scrolling back reverses it.
- [ ] Desktop: tabbing to an element in a card outside the pinned viewport scrolls it into view without visible
      flicker; mouse clicks do not move the page; resizing across `lg` or the height threshold leaves no leftover
      transform, `data-pinned` or pin spacer, and other page triggers stay correct.
- [ ] Desktop: focus rings, borders and shadows of the first and last card are not cut by the clip; the last card ends
      with padding above the viewport bottom.
- [ ] Pin mechanics: no ancestor of the section has `transform`, `filter`, `will-change` or `contain`; with the pin
      active the left column stays `align-self: start` and the pin-spacer keeps the cell's grid placement.
- [ ] With Lenis there is no visible pin or scrub trail (the scroll-animation skill's one-frame trail check), checked
      in the browser; if visible, a decision is recorded in `docs/decisions.md`.
- [ ] Anchor visit to `#experience` and a scroll-restored reload do not jump when the pin applies.
- [ ] JS off, reduced motion, below `lg`, a short viewport, a failed GSAP import, and a track shorter than the
      container: everything visible and unclipped, no pin, no translate; no GSAP chunk under reduced motion. No JS:
      descriptions expanded, no toggle buttons.
- [ ] After fonts load and after a window resize the pin distance matches the track height (last card reachable, no
      dead scroll at the end).
- [ ] The mobile toggle works with mouse and keyboard, keeps `aria-expanded` and `aria-controls` in sync, its accessible
      name contains the visible title text; rows start collapsed; collapsed text is not reachable by tab or screen
      reader. On desktop the descriptions are open, in the accessibility tree, the title heading remains, and there is
      no button or `aria-expanded`.
- [ ] Count label reads correctly for the plural forms in `en` and `uk`.
- [ ] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`; Studio builds.

## Decisions

- Role label shows on all sizes, as the mobile reference image does (overrides the first brief).
- One entry component, CSS media query instead of `useIsMobile`: no hydration flash, works without JS.
- Pin the cards column (a viewport-height container whose track is scrubbed upward), not the intro; not CSS sticky.
  This reverses the earlier decision to pin the intro, by the author's explicit instruction. A bare pin on the cards
  would freeze them, hence the scrubbed track.
- Reveal on the pinned track is driven by rect checks in the pin's `onUpdate`, not `containerAnimation`.
- Container uses `overflow: clip`, so focus cannot scroll it behind GSAP's back; `focusin` scrolls the page instead.
- Height and clip are keyed on `data-pinned`, set before measuring and removed again if there is nothing to traverse:
  otherwise no JS, reduced motion or a failed GSAP import would clip content nobody can reach.
- `y` and `end` are functions over one `getDistance()` so `invalidateOnRefresh` re-reads both; `focusin` maps by
  `getBoundingClientRect` deltas, 1:1, scrolled through Lenis.
- Pin only from a minimum viewport height, provisional `40rem`; all provisional values are listed once in Design.
- Padding: inline on the container, vertical on the track, so `getDistance()` includes it.
- Logo size comes from Sanity asset metadata in the query, never from the asset ref; fixed tile fallback.
- `ignoreMobileResize` is global, set once in `loadGsap`.
- Browse-mode and find-in-page limitation accepted; the `scrollTop`-driven container is the known alternative.
- Logo is a plain decorative `image`; "Present" is a `messages` key.
- At sync, `docs/decisions.md` gets: the cards-column pin with a scrubbed track, the CSS-only responsive entry state,
  and an update to D10 (a second section now uses scroll motion).

## Tasks

1. Block 1, schema: `logo` on `experience`; `experienceSection` fields (`buttons`); `anchorId` check; Studio build.
2. Block 2, query and types: `experienceSection` branch with logo metadata, `experience` tag, `pnpm typegen`.
3. Block 3a, static structure: `ExperienceSection`, `ExperienceTimeline` (markup only), `ExperienceEntry`, helpers,
   messages, `SectionRenderer` case, styles, mobile disclosure.
4. Block 3b, reveal: normal-flow reveal (ii) and the pinned-track reveal logic, cleanup.
5. Block 3c, desktop pin: height constant, pin, scrub, `data-pinned` order, scroll restore, `focusin`,
   `ResizeObserver`, fonts, refresh, `loadGsap` config.
6. Block 4, docs sync: this spec, `content-model.md`, `decisions.md` (D10), README, roadmap, the scroll-animation
   skill trap and `smooth-scroll.md` (a second section now uses scroll motion).

## Open questions

- Reviewer concerns on the pinned track, to be settled in the browser: the CV buttons leave the screen while the cards
  are pinned; total scroll distance may feel long; the one-third reveal on a moving track; Lenis with a scrubbed pin
  (Lenis calls `ScrollTrigger.update` on scroll, no scroller proxy); `100svh` and iPad-size touch screens at `lg`.
- Provisional values (Design) to confirm in the browser.
- Exact media string for condition (ii) as the complement of (i), chosen in Block 3b.
- Date format: `Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' })` gives "Jul 2025" in
  `en`; `uk` is expected to add "р." and a dotted month, not checked. Proposal: accept the ICU output after a look in
  the browser.
- Heading levels are stated relative to the section headline; the absolute levels depend on what `Headline` renders
  (not checked).
