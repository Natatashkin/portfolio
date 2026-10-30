# Career section

Status: done, with a pending change to the button (see Change) until it is implemented. No other open questions (not
observed: the eyebrow-only section, a failed GSAP import; the frame-by-frame no-flash check was not done and is
accepted by the author)

## Change: one `button` instead of `buttons[]`

Now the section shows a `buttons[]` list, which holds the two CV downloads (EN and UK, D15). The CV downloads move to
the [Experience section](experience-section.md). Career gets one optional `button` (a single `linkButton`, field-level
`initialValue` `linkType: external`, variant `primary`, `linkType` stays editable). The data is re-entered by hand in Studio; no migration script.

Order: the Career query and field change ships only after the author has re-entered the data in Studio; until that
block the Career query keeps `buttons`. The requirements below that are marked unchecked belong to this change.

- [ ] `careerSection` has one field `button` (`linkButton`, `initialValue` `linkType: external`, variant `primary`,
      `linkType` editable) and no `buttons`.
- [ ] The `careerSection` branch of `PAGE_QUERY` drops `buttons` with its D15 download resolution and projects `button`
      like the other single-button sections: `linkType`, `url`, `hasAnchor`, `anchor`, `variant`, `hasIcon`, localized
      label; no download fields.
- [ ] `CareerSection` renders the single `button` through `LinkButton` inside `career__actions`; nothing renders when it
      is empty. `CareerText` still staggers `career__actions` as one root element.
- [ ] No CV-button code is left in `CareerSection` (no `buttons` array, no download or file logic).

Tasks:

1. Schema: field `button` in `sanity-cms/schemaTypes/sections/careerSection.ts`, replacing `buttons`; Studio build.
2. Author re-enters the data in Studio (by hand).
3. Query: the `careerSection` branch in `app/src/lib/sanity/queries.ts`; `pnpm typegen`.
4. Component and types in `CareerSection/`: replace the buttons array and CV logic with one `LinkButton`; the
   `career__actions` wrapper and the `CareerText` stagger target must still work with one root element.
5. `pnpm format` and `pnpm code-quality` in `app/`; then update this spec (requirements, Design, Files) and drop the
   Change section.

## Goal

Show the author's career path ("My way"): an intro with one button and a short list of steps laid over a road photo,
ending with a handwritten tagline. The section also makes the hero's dot grid a shared component.

The overlay mode (cards on the cover, desktop diagonal, mobile zigzag, marker with its line to the road) is built and
must not change; later work adds only the reveal and the pulse to it.

## Requirements

- [x] Renders `eyebrow`, `headline`, rich-text `description`, `buttons` (may be a CV download, D15; becomes one
      `button`, see Change), `steps` (`road`
      references, in order; `period`, `title`, `description` per card), `tagline` and `cover`. Every field is optional;
      a missing one renders nothing, never an empty wrapper.
- [x] Without a desktop cover asset no image renders, the steps fall back to the plain list and the text still renders.
      The tagline shows only together with a cover or steps (D20).
- [x] Desktop (`lg` up): text column on the left; on the right the cover with the step cards overlaid diagonally, the
      tagline below. Mobile: the cover is a full-bleed background; the text, then the cards in a zigzag, then the
      tagline. A dot grid shows from `lg` up only.
- [x] Mobile only: a top wash in the page colour keeps the theme's text readable and a bottom scrim keeps the light
      tagline readable over the road, in both themes.
- [x] The tagline is handwritten (Caveat, D19) with an underline. On the photo (below `lg`) it is white with a soft
      shadow; from `lg` it sits on the page background in the text colour.
- [x] Plain list (more than four steps, or no cover; a fallback): desktop is one non-wrapping row of equal-width cards
      for any step count, long text wraps; mobile is a column. Markers sit centred above each card on desktop and in a
      left gutter, centred on the card, on mobile. Dashed lines join the markers (desktop: one line; mobile: a
      segment per item, none after the last, the last marker covers the end).
- [x] The plain-list lines are drawn gradually with `scale` in step with the items appearing; without JS and under
      reduced motion they are fully drawn.
- [x] The last step's marker pulses continuously once its item is revealed (a CSS ring on `transform` and `opacity`,
      only under `no-preference`; static before the reveal, without JS and under reduced motion).
- [x] Text reveal (GSAP + ScrollTrigger, once): headline, description and buttons fade in and rise with a stagger when
      `career__textBody` reaches `top 80%`; the eyebrow is not animated.
- [x] Steps reveal (cards and plain-list items): desktop, one tween with a stagger started by one trigger on the
      `<ol>`; mobile, one trigger per item. Only `transform` and `opacity` animate; inline styles are cleared after.
- [x] Without JS and under `prefers-reduced-motion` everything is visible and static: the server HTML is final, the
      hidden state is applied by GSAP only after it loads, only under `no-preference`, and only for elements whose
      trigger has not been reached (one already past its line is left alone). No GSAP chunk loads under reduced motion.
- [ ] A failed GSAP import leaves the static state (a `.catch` in the code; not simulated).
- [ ] A section with only an eyebrow renders no `career__textBody` and no client text component. The schema has no rule
      against it (all fields are optional; the author chose not to add one); the guard is from code and was not
      observed, because it needs such data in Sanity.
- [x] `HeroGrid` becomes the shared `DotGrid` in `components/ui/DotGrid`, unchanged in the hero; `HERO_GRID_*` becomes
      `DOT_GRID_*`.
- [x] Steps are an ordered list; markers, dots and lines are `aria-hidden`; text is readable over the photo in both
      themes; no interface strings, nothing is added to `messages/`.

## Design

- **Schema and query:** `careerSection` and `road` in [../specs/content-model.md](../specs/content-model.md); the
  `careerSection` branch of `PAGE_QUERY` filters dangling step references and, today, resolves download files for
  `buttons` (D15). The pending change (see Change) drops `buttons` with that resolution and projects `button` as
  described there.
- **Split:** `CareerSection` is a Server Component. `CareerText`, `CareerSteps` and `DotGrid` are client leaves.
  `CareerSteps` is rendered twice (`mobile`, `desktop`), keeps only the variant for the viewport after hydration and is
  CSS-hidden before it (D17).
- **Overlay vs plain list:** `isOverlay` = a cover and at most `MAX_OVERLAY_STEPS` (4) steps; otherwise both variants
  render the plain list and the media wrapper gets `career__mediaWrapper--plain`. The wrapper and the desktop line
  exist only in the plain list, so the overlay markup stays untouched.
- **Untransformed trigger:** the `li` keeps layout and is never animated; the inner `steps__card` carries the visual
  box and the marker and is the only animated element (a transformed trigger would move its own `start`).
- **Lines:** real `aria-hidden` elements (GSAP cannot animate pseudo-elements), positioned with `left`/`top`/`margin`,
  never `translate` (the scale tweens and `clearProps: 'transform'` would overwrite it); `transform-origin` is in CSS.
  Desktop: `steps__line` in the `steps__plain` wrapper, an independent `scaleX` tween in the cards' `onEnter` that
  reaches each marker as its item starts. Mobile: one `scaleY` segment per item in that item's own `onEnter`.
- **Trigger `start`** is a function capped at `ScrollTrigger.maxScroll(window) - 1` (reason in Decisions), line 0.5 on
  the `<ol>` (desktop) or 0.85 on each `li` (mobile). No `ScrollTrigger.refresh()`: the page height does not change
  after load and ScrollTrigger re-evaluates a function `start` on resize.
- **GSAP:** follow the `scroll-animation` skill. Section-specific: the `CareerSteps` effect depends on
  `[isAnimated, variant, isOverlay, steps]`; the reveal tweens start from `onEnter`, outside the matchMedia context,
  so the cleanup of the `mm.add` callback kills the trigger, the tweens and their inline styles; the last item's
  `onComplete` sets `data-revealed`, which starts the pulse.
- **`CareerText`:** owns the `career__textBody` ref and takes its `className` from the section (it never imports the
  section's SCSS module); the section renders it only when headline, description or buttons exist. The stagger targets
  are `ref.children`, so each part renders one root element (true for `Headline`, `RichText` and the actions `div`;
  with a single `button` the `career__actions` wrapper stays that one root).
- **Edge cases:** a card with no text is skipped; an empty `uk` value falls back to `en` in GROQ (D3); if the button
  renders nothing, the empty `career__actions` is still staggered and takes a gap (accepted). Also accepted: a button
  at opacity 0 stays focusable; a line may lead its marker by the card's fade; the mobile segment end can be a few px
  off when card heights differ; dashes stretch while a line draws.

## Files

- `app/src/components/sections/CareerSection/`: `CareerSection`, with private `CareerSteps/` and `CareerText/`.
- For the pending change: `sanity-cms/schemaTypes/sections/careerSection.ts`, `app/src/lib/sanity/queries.ts`,
  `app/src/sanity.types.ts` (generated), `CareerSection/` (component, types).
- `app/src/components/ui/DotGrid/`: moved and renamed from `HeroSection/HeroGrid`; the hero imports it.
- `app/src/hooks/useIsMobile.ts`: viewport subscription, `null` on the server.
- `app/src/lib/constants.ts`, `styles/_tokens.scss`, `styles/_mixins.scss`, `app/[locale]/layout.tsx`: the new query
  constants, the handwriting / on-photo / scrim tokens, the eyebrow rule colour, the Caveat font.

## Acceptance criteria

- [x] Renders in `en` and `uk`, light and dark, mobile and desktop; the `uk` plain list wraps long text without
      overflow. Empty or unexpected CMS data does not throw; the cards stay on the cover with four steps (author
      confirmed).
- [x] Overlay unchanged except for the pulse ring on the last marker.
- [x] JS off and reduced motion: text and cards visible, lines fully drawn, no pulse; reduced motion loads no GSAP
      chunk (production build). The content is in the server HTML (`/en`, `/uk`).
- [x] Text reveals once at `top 80%`; desktop steps appear one after another, mobile steps each at their line;
      `data-revealed` lands on the last `li`; a resize across `lg` (both ways) and a soft language switch rebuild the
      reveal without stale triggers or hidden items; no inline style remains afterwards.
- [x] Plain list (with a cover, and with four steps forced past the limit): desktop row, markers and `scaleX` line
      drawn in step with the cards, tagline below; mobile gutter markers and `scaleY` segments; the pulse after the
      reveal, in the overlay too.
- [x] No flash: a reload or resize past the line leaves the content visible (seen); the frame-by-frame check was not
      done, the author accepted it. By design an item in the lower half of the viewport at GSAP load is hidden after it
      was visible; rare, accepted.
- [x] `pnpm format`, `pnpm code-quality` and `pnpm build` pass in `app/`.
- [ ] Career renders its single `button`; no CV-button code is left in it (the Change block above).

## Decisions

In [../decisions.md](../decisions.md): D16 shared `DotGrid`, D17 `CareerSteps` rendered per viewport, D18 GSAP reveal and
the continuous pulse, D19 Caveat as the handwriting accent, D20 the tagline needs a cover or steps. Here:

- Card positions are CSS by index, not data: designed for four steps, the author controls the count.
- The plain list is an animated fallback with markers (author decision); its lines are separate tweens, no shared
  timeline, because the stagger timing already puts the desktop line at each marker.
- The step `start` is a function capped at `maxScroll - 1`: a short list near the page end could not be scrolled up to
  a fixed line, and GSAP's `clamp()` on `start`/`end` did not fix that.
- `--color-accent-ink` for the eyebrow rule (shared mixin, so the hero's too) and, from `lg`, the tagline underline:
  `--color-accent` is too pale on the light page background. Markers, lines and the pulse keep `--color-accent`.
- On the photo the tagline is white with a bottom scrim (`--color-on-primary` turns dark in the dark theme).
- `CareerText` owns the `career__textBody` ref and takes its class as a prop.
- Two CV buttons (D15) in a row today; they move to the Experience section and Career keeps one `button` (author
  decision, see Change). No minimum height; `MOBILE_QUERY` mirrors `lg`; `useIsMobile` stays in `hooks/`.
