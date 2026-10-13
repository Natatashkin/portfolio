# Language switcher

Status: done, with caveats: a real screen reader and the announcement after a full document load are deferred; the anchor landing (`#career`) and the second-page check wait for a section with an anchor id and a second page

## Goal

The visitor switches the page between Ukrainian and English from the header with one control.

## Requirements

Requirements are the author's decisions; implementation choices agreed with the author are labelled as such.

### Language switcher

- [x] One control that shows the text `EN` or `UK`: the language the visitor would switch **to** (on `uk` it shows
      `EN`, on `en` it shows `UK`).
- [x] The label is fixed in code and is not localized; it is never taken from `messages/`
      (`target.toUpperCase()`, `LanguageSwitcher.tsx:61`).
- [x] Activating it opens the same page in the other locale.
  - Implementation detail (not part of the requirement): the `href` has an explicit locale prefix, also for the default
    locale (`href="/en"` on `uk`); the proxy redirects `/en` to `/`.
- [x] Desktop (from `lg`, 1024px): placed in the header next to the theme switcher (`header__controls` group,
      `Header.tsx:31-34`).
- [x] Burger menu (below `lg`): placed after the theme switcher and before the social links (`Header.tsx:38-40`).
      **Provisional**: the burger menu is a temporary template and will be redesigned, so this placement may move.
      Block 2. Verified in Chrome at about 844px: order in the accessibility tree is Logo, Menu button, nav links, theme
      button, language link, Linkedin, GitHub.
- [x] Without JavaScript it is a real link that navigates to the other locale's URL; the cookie behaviour without
      JavaScript is verified (Design, "Locale cookie").
- [x] Keyboard-operable with the shared focus ring. Checked manually by the author on both copies, both locales and both themes.
- [x] In the burger menu, using it closes the panel (the panel closes on any click on an `<a>` inside it,
      `BurgerMenu.tsx:35`). Verified in Chrome with a real click: `data-open` false afterwards, scroll lock released
      (no `overflow: hidden` left on `<html>`).
- [x] **Decision:** the element is a `Link` (navigation, crawlable), not a `button` with `router.replace`.
- [x] **Decision:** the `#hash` of the URL is kept on switch (`/#career` -> `/uk#career`). Verified in both
      directions; landing on the section itself is not verified (Design, "What happens to path, anchor and scroll").
- [x] **Requirement:** after switching, a screen reader announces the change of page language, in both cases (soft
      and full navigation), in the NEW page language. Built as a live region outside React (Design,
      "Accessibility"). Checked in the DOM in the soft navigation; not tested with a real screen reader.
- [x] **Decision:** the accessible name names the **target** language, in the page language: en page "Switch
      language to: Ukrainian", uk page "Перемкнути мову: англійська", localized in `messages/{en,uk}.json`
      (`LanguageSwitcher.label`).
- [x] **Decision (author):** the name keeps the `aria-label` and **starts with the visible code**, then describes the
      target language: "UK. Switch language to: Ukrainian" (en) / "EN. Перемкнути мову: англійська" (uk). The visible
      text is literally the start of the name (label in name, WCAG 2.5.3). Verified in the DOM: the `aria-label` is
      exactly these strings.
- [x] **Requirement (accessibility, author):** the visible label text carries `lang`: `<span lang="uk">UK</span>` and
      `<span lang="en">EN</span>`, because the attribute describes the language of the label text itself. It is on the
      inner `<span>` (`LanguageSwitcher.tsx:61`). **Limit:** because the link has an `aria-label`, the name is taken
      from the label, so `lang` on the inner span does not reach assistive tech through the name; it only marks the
      visible text. The code at the start of the name is read in the page language.
- [x] The remounted layout returns keyboard focus to the visible switcher after a switch, so it is not lost to
      `<body>` (D14). Verified by keyboard in Chrome, three switches in a row.

## Design

### Locale switching with `localePrefix: 'as-needed'`

- `routing` has `locales: ['en', 'uk']`, `defaultLocale: 'en'`, `localePrefix: 'as-needed'`
  (`app/src/i18n/routing.ts:3-8`): English has no prefix, Ukrainian is under `/uk`.
- `navigation.ts` already exports the locale-aware `Link`, `usePathname`, `useRouter` (`app/src/i18n/navigation.ts:4`).
  `usePathname` returns the path without the locale prefix, so `<Link href={pathname} locale={target}>` builds an
  explicit prefix even for the default locale. Verified in the browser: from `uk` the `href` is `/en`, from `en` it
  is `/uk`. The proxy redirects `/en` to `/` with a 307, so the visitor lands on `/`.
- Chosen element (author's decision): **`Link`** (navigation, crawlable) rather than a `button` with
  `router.replace`.
- Target locale: `routing.locales.find((item) => item !== locale)` with `useLocale()`; the label is that value
  uppercased (`LanguageSwitcher.tsx:40`). With two locales this is unambiguous; a third locale would need a different
  control.

### Locale cookie

Source read: next-intl 4.14.9, development build (`node_modules/.pnpm/next-intl@4.14.9_.../next-intl/dist/esm/development/`);
the `production` build has the same files.

- With JavaScript: `Link` with a `locale` that differs from the current one renders `LocaleChangingLink`, which sets
  `hrefLang`, `prefetch: false` and an `onClick` (`navigation/shared/BaseLink.js:14-40`). That `onClick` calls
  `syncLocaleCookie` (`BaseLink.js:23-29`), which writes `document.cookie` with the `NEXT_LOCALE` value
  (`navigation/shared/syncLocaleCookie.js:8-39`). The comment there says this is needed because the Next router cache
  can skip the server request.
- Without JavaScript the `onClick` does not run, so only the proxy can set the cookie on the response for the new
  path. `syncCookie` (`middleware/syncCookie.js:3-40`, called at `middleware/middleware.js:158`) does so only for
  document requests (`sec-fetch-dest` absent or `document`, lines 18-19): it overwrites an outdated cookie, and when
  there is no cookie it sets one only if the `Accept-Language` locale differs from the resolved locale.
- The proxy (`app/src/proxy.ts:4`) uses next-intl defaults, so `localeCookie` and `Accept-Language` detection at `/`
  stay on.
- **Verified in block 1:**
  - With JavaScript (Chrome): after switching `uk` -> `en`, `NEXT_LOCALE=en` exists.
  - Without JavaScript (curl, `Accept-Language: uk`, no cookie): `GET /en` -> 307 to `/` with
    `Set-Cookie: NEXT_LOCALE=en`; then `GET /` with that cookie -> 200 (no bounce back to `/uk`). `GET /uk` sets
    `NEXT_LOCALE=uk`.
  - Without the cookie, `GET /` with `Accept-Language: uk` -> 307 to `/uk`. So the cookie is what keeps a visitor on
    English after choosing it.

### Navigation behaviour (verified in Chrome on the dev server, block 1)

- There is a single root layout, `app/src/app/[locale]/layout.tsx`, with a dynamic `locale` param, and it renders
  `<html lang={locale}>`.
- The locale switch is a **soft navigation**: a marker set on `window` survives, there is no document reload and the
  `performance` navigation type is unchanged. `<html lang>` is updated (en <-> uk).
- But the **whole locale layout subtree is remounted**: the `header` and live-region DOM nodes are replaced by new
  ones, because the dynamic segment key changes. Consequence: React state cannot carry anything across the switch;
  state that must survive goes through `sessionStorage` (decision D14 in [../decisions.md](../decisions.md)).
- Scroll resets to 0. The page is only about 90px taller than the viewport, so this was barely testable; Lenis keeps
  working after the switch.
- Not verified: a full document load of the other locale (opening `/uk` directly) with the announcement flag set. It
  would use the same mount path, but it was not exercised.

### What happens to path, anchor and scroll

- Path: kept (via `usePathname`). Only the home page exists today; `/projects` and `/cases` are placeholders.
- Anchor (decision: keep the hash): `usePathname` and `Link href` carry no hash, so by default a `#career` URL would
  become `/uk` without it. The hash is read on the client from `window.location.hash` and appended to the `href`,
  without a hydration mismatch: `useSyncExternalStore` with a server snapshot of an empty string and a client
  snapshot of `window.location.hash`, the subscription named `subscribeToHash` (it listens to `hashchange`;
  `LanguageSwitcher.tsx:10-38`).
- **Finding:** appending the hash to the `href` is not enough. The soft navigation goes through `/en` and the proxy
  redirect to `/`, and that drops the hash (verified: `/uk#career` -> `/`). The fix: `onClick` stores the hash in
  `sessionStorage` (`rememberLocaleSwitch`), and `LanguageAnnouncer` in the new layout restores it after 150 ms, if
  the URL has none, with `history.replaceState(history.state, '', path + search + hash)`, which keeps Next's history
  state and adds no history entry, then calls `scrollIntoView` on the element with that id if it exists
  (`LanguageAnnouncer.tsx:51-59`). Verified in Chrome in both directions, including three switches in a row with
  `#career` kept. Each switch adds one history entry (the navigation itself); the hash restore adds none.
- Not verified: landing on the section. No element with id `career` exists yet, so the `scrollIntoView` branch and
  how Lenis handles it are checked when the section exists.
- No hydration warning in the console on `/uk#career` and `/` (the server snapshot of the hash is empty).
- Scroll and Lenis: see "Navigation behaviour".

### Accessibility

- Same look, focus ring and target size as the theme switcher: muted text with the `DotIcon` on the right, same gap,
  padding, font size and hover (the author's styling decision; checked by computed styles: gap, padding, font size,
  weight and colour match the theme button).
- Announcement (requirement): the change of page language is announced in the NEW page language. Built as
  `LanguageAnnouncer` (`components/ui/LanguageAnnouncer/`), rendered in `[locale]/layout.tsx:55`:
  - It creates one visually hidden `role="status"` region in `document.body` **outside React**
    (`getRegion`, fixed id `language-announcer`), because a React-owned region is replaced when the locale layout
    remounts and its text is lost.
  - `onClick` of the switcher remembers the switch in `sessionStorage` (key `localeSwitch`, value `{hash, at}`), only
    for a plain left click: not `defaultPrevented`, button 0, no meta/ctrl/shift/alt (`isPlainClick`,
    `LanguageSwitcher.tsx:20-26`). A modified click opens a new tab and must not leave a flag. Verified: a synthetic
    Ctrl-click leaves no flag.
  - `LanguageAnnouncer` does all post-switch work in one place, after a 150 ms timer (lets the remounted layout
    settle and assistive tech register the region), and only if `takeLocaleSwitch()` returns a fresh switch
    (`LanguageAnnouncer.tsx:48-74`): (a) restore the hash (see above); (b) focus the visible copy of the switcher, or
    the menu toggle when only the burger copy exists (`findFocusTarget()`, see below), with
    `focus({ preventScroll: true })`, because the layout remount drops focus to `<body>` and the scroll position is
    already settled by (a) (`LanguageAnnouncer.tsx:65`); (c) empty the region and, in the next tick, set `LanguageSwitcher.announcement` in the new language, so
    a repeated switch to the same language is a real text change.
  - `takeLocaleSwitch()` reads and clears the key and returns `null` when it is absent, malformed or older than 10 s
    (`localeSwitch.ts:27-40`). A stale flag therefore gives no announcement and no focus move (verified with a 60 s old
    flag).
  - Verified in Chrome by keyboard, three consecutive Enter presses en -> uk -> en -> uk: focus stayed on the switcher
    with the right label, `#career` kept, the region text updated ("Language changed to: English" / "Мову змінено:
    українська"), one region, the `window` marker alive, no leftover storage key.
  - Dev-only detail: the switch is read inside the timer, because Strict Mode runs the effect twice and the first
    run's timer is cleared; reading it earlier would consume it for nothing. The effect cleanup clears both timers,
    the 150 ms one and the inner announcement timer (`LanguageAnnouncer.tsx:74-77`).
  - Verified again in Chrome after these changes: `/uk#hero` -> `/#hero` -> `/uk#hero` by keyboard Enter, hash kept
    each time, `html.lenis` present and not `lenis-stopped`, wheel scroll still moves the page (`scrollY` 92; the
    page is only about 90px taller than the viewport), focus on the switcher after each switch, one live region,
    text "Language changed to: English" / "Мову змінено: українська", no leftover storage key.
  - Burger copy (block 2, Chrome, about 844px, real click in the open menu, `uk` -> `en`, dark theme stored): soft
    navigation (the `window` marker survived), URL `/#hero` (hash kept), `<html lang>` `en`, menu closed, live region
    "Language changed to: English", `data-theme` and the stored theme still `dark`.
  - Focus after a switch from the burger: the switcher copy in the burger panel cannot take focus once the panel is
    closed, so `findFocusTarget()` falls back to the menu toggle (`[data-menu-toggle]` on the `BurgerMenu` button,
    `aria-label` "Menu", `aria-expanded` false). It picks the first `[data-language-switcher]` that is visible (not
    inside a `[data-open="false"]` panel, and `checkVisibility({ visibilityProperty: true })` is true, or
    `getClientRects().length > 0` where `checkVisibility` is missing, before Safari 17.4), else the toggle, and
    focuses it with `preventScroll` (`LanguageAnnouncer.tsx`). Verified for the burger case at the mobile layout; the
    `checkVisibility` fallback is not exercised.
  - Styles: the language link and the theme button share the `muted-control` mixin (`styles/_mixins.scss`); colour
    on `:hover` and `:focus-visible` (not `:focus`); the theme switcher's hard-coded `250ms` is now
    `var(--transition-base)`. Computed styles match in the burger panel (gap, padding, font size, colour,
    transition).
  - Not verified: output of a real screen reader (only the region's role and content were checked in the DOM) and the
    announcement after a full document load.
- `lang`: decided and built on the inner `<span>` of the visible label, see Requirements.
- The two copies of the switcher (desktop row and burger panel) are covered in "Duplicates in desktop row and burger
  menu".

### Accessible names and message keys

- `LanguageSwitcher.label` is "{code}. Switch language to: {language}" (en) /
  "{code}. Перемкнути мову: {language}" (uk), with `{code}` the visible code and `{language}` the **target** language
  named in the page language (`en.json:17`, `uk.json:17`; `LanguageSwitcher.tsx:53-57`). Built and verified in the
  DOM: en page "UK. Switch language to: Ukrainian"; uk page "EN. Перемкнути мову: англійська". The aria-label is kept
  and starts with the visible code, so the visible text is the start of the name.
- Keys added in block 1: `LanguageSwitcher.label` (`{code}`, `{language}`), `LanguageSwitcher.announcement` (`{language}`:
  "Language changed to: English" / "Мову змінено: українська", the new page language) and
  `LanguageSwitcher.languages.{en,uk}`.

### Hreflang

Existing locale configuration (implemented):

- Routing with `as-needed` (`routing.ts:3-8`) and the proxy (`app/src/proxy.ts`).
- The proxy sets next-intl's alternate-links `Link` response header on non-redirect responses
  (`middleware/middleware.js:159-167`, when `alternateLinks` is on, which is the default). For non-domain routing the
  header value includes an `x-default` entry for the default locale
  (`middleware/getAlternateLinksHeaderValue.js:80-90`).

Not implemented, required before launch (SEO):

- `<head>` `alternates`/hreflang tags (en -> `/`, uk -> `/uk`, x-default -> `/`) belong to the "Page metadata and SEO"
  feature and are on the Launch checklist in [../roadmap.md](../roadmap.md). A search of `app/src` for `alternates`,
  `hreflang`, `x-default` and `languages` finds nothing. This feature does not add them.
- `hrefLang` on the switcher `Link` (set by next-intl, `BaseLink.js:35`) is only an additional hint.

### Labels and strings

- `EN` / `UK`: constants in code (language codes), not translatable, not in `messages/`.
- Aria-labels and the language-change announcement: see "Accessible names and message keys".

### Interaction with the theme

A soft locale switch used to lose the chosen theme on `<html>`; this is fixed and tracked in
[theme-switcher.md](theme-switcher.md).

### Duplicates in desktop row and burger menu

`Header` renders the navigation and switchers twice (`Header.tsx:29-43`): in `header__desktop` and as `BurgerMenu`
children. What the CSS does:

- `.header__desktop`: `display: none` by default, `display: flex` from `lg` (`Header.module.scss:27-37`).
- `.headerMenu` (the burger block): `display: none` from `lg` up (`BurgerMenu.module.scss:3-6`). Below `lg` the toggle
  is shown.
- `.headerMenu__panel` (closed state): `opacity: 0; visibility: hidden` (`BurgerMenu.module.scss:38-39`); open state
  `data-open='true'` sets `visibility: visible` (`:46-49`). `visibility` flips after a 250ms delay on close (`:44`).

So at each breakpoint exactly one of the two copies is hidden by `display: none` (desktop row below `lg`, whole burger
block from `lg`), and in the closed panel the other is `visibility: hidden`. Per the CSS spec these are removed from
the accessibility tree and tab order, but this spec does not take that as proven: it is checked in the browser (see
Acceptance criteria and Tasks). No `inert` or `aria-hidden` is set in the SCSS files read; JS in `BurgerMenu.tsx` was
not part of this check.

Checked in Chrome (block 2) at the mobile layout (about 844px, the widest this browser tool reaches), burger menu
open: the interactive accessibility tree lists Logo link, Menu button, nav links (Кейси, Проекти), theme button
"Перемкнути тему: Темна", language link "EN. Перемкнути мову: англійська" (href `/en#hero`), Linkedin, GitHub. Only the
burger copy of each switcher is exposed; the desktop copy is `display: none`. After a switch the closed panel's copy
cannot take focus, which is why the announcer falls back to the menu toggle. The desktop breakpoint (`lg` and above)
was checked earlier by the author, who states it is done and "all ok" (the author's confirmation, no numbers
recorded here).

### Layout differences between locales

Observation, not a defect of the switcher: the page layout shifts when the locale is switched, because the content
length differs between `uk` and `en`. Measured in Chrome with a 1400px iframe loading `/uk` and `/` separately, and
at 844px by a real switch:

- Document height at 1400px: 1082px (`uk`) vs 984px (`en`).
- The quote caption under the photo is taller in `uk` (81 vs 54px), so the portrait (image top 196 vs 160px) and the
  figure (633 vs 535px) move.
- The stack chips wrap to two lines in `uk` (66 vs 31px; the chip "Відповідальність за продукт" is longer), pushing
  the CTA (top 609 vs 546px) and the metrics (796 vs 698px) down.
- The header navigation width differs (225 vs 210px), and the theme button differs in width and left position (88px
  wide at 1160 vs 73px wide at 1174) because of the label text.
- At 844px only the h1 and CTA widths differ (text); no vertical shift.

**Decision (author):** accepted as natural. Text length differs between the languages, and the layout is not
changed to compensate for it.

### UI and server/client split

- `LanguageSwitcher` in `components/ui/LanguageSwitcher/` (folder rules: [../conventions.md](../conventions.md#components)):
  a small client component (`useLocale`, `usePathname`, the hash store, a click handler); no React state. It restores
  nothing itself and carries `data-language-switcher` so the announcer can find it.
- `LanguageAnnouncer` in `components/ui/LanguageAnnouncer/`: client component that renders nothing; manages the live
  region in `document.body` and does the post-switch hash restore, focus and announcement.
- `lib/helpers/localeSwitch.ts`: `sessionStorage` helpers `rememberLocaleSwitch(hash)` and `takeLocaleSwitch()`
  over one key, exported through the `lib/helpers` barrel (`import { rememberLocaleSwitch } from '@/lib/helpers'`);
  storage failure is swallowed (the switch still works, only the hash, focus and announcement are skipped).
- `Header` stays a Server Component. The switcher is in the desktop row (`Header.tsx:33`, block 1) and in the
  `BurgerMenu` children after `ThemeSwitcher` (`Header.tsx:39`, block 2).
- `.header__desktop` is `justify-content: space-between`, so the two switchers go into one group element
  (`header__controls`) to stay together on the right.
- **Edge cases:** an unknown locale never reaches the header (the layout calls `notFound()`, `layout.tsx:31`).

## Files

- `app/src/components/ui/LanguageSwitcher/`: new, `Link` to the other locale (`LanguageSwitcher.tsx`, `.module.scss`
  with `var(--transition-base)`, `index.ts`).
- `app/src/components/ui/LanguageAnnouncer/`: new, live region outside React plus post-switch hash, focus and
  announcement (`LanguageAnnouncer.tsx`, `.module.scss`, `index.ts`); rendered in `app/src/app/[locale]/layout.tsx`.
  Block 2: `findFocusTarget()` falls back to the menu toggle when no switcher copy is visible.
- `app/src/lib/helpers/localeSwitch.ts`: new, `sessionStorage` helpers for the remembered switch.
- `app/src/components/layout/Header/Header.tsx` and `Header.module.scss`: placement in the desktop row
  (`header__controls`) and, block 2, the second copy in the `BurgerMenu` children after `ThemeSwitcher`.
- `app/messages/en.json`, `uk.json`: `LanguageSwitcher` strings added in block 1.

## Acceptance criteria

- [x] On `/` the control shows `UK` and leads to `/uk`; on `/uk` it shows `EN` and leads to `/`.
  - Implementation detail: on `uk` the `href` is `/en` (explicit prefix), which the proxy redirects to `/`.
- [ ] The switcher builds the target URL from the current pathname: home `/` <-> `/uk`; any other path keeps its
      path and gains or loses the `/uk` prefix. A test on a real second page is done when such a page exists
      (`/projects` and `/cases` are placeholders and are not the target of this check).
- [x] Navigation check done and recorded: navigation type (soft), scroll position, Lenis state, `<html lang>`; the
      announcement mechanism and the live region's location are chosen from it (Design, "Navigation behaviour").
      The theme was lost on a soft switch; that was fixed and is tracked in [theme-switcher.md](theme-switcher.md).
- [ ] The `#hash` is kept: `/#career` -> `/uk#career` and back (verified, also from the burger copy: `/uk#hero` ->
      `/#hero`), no hydration warning from the hash (verified); the page lands on the section is **open**: no element
      with id `career` exists yet.
- [ ] The language change is announced in the new page language in both soft and full navigation, checked with a
      screen reader or the accessibility tree / live-region log in the browser. Soft navigation: live region content
      checked in the DOM; full navigation and a real screen reader are open.
- [x] Cookie check done and recorded: `NEXT_LOCALE` after a switch with JavaScript, and without JavaScript (curl).
- [x] Desktop: next to the theme switcher (desktop check confirmed by the author); burger menu: after it
      (`Header.tsx:38-39`); the panel closes after the switch (verified with a real click).
- [x] Both copies of the language and theme switchers (header placement) checked in the browser (accessibility tree and
      tab order) at a breakpoint below `lg` and at `lg` and above: one reachable copy at a time. Below `lg`
      (about 844px, burger open) checked in block 2 in the accessibility tree: only the burger copy is exposed; the
      closed-panel copy was shown by the focus fallback (focus lands on the menu toggle). At `lg` and above: the
      author's confirmation ("all ok"), not recorded with numbers. The author confirmed the criterion stays ticked
      with this scope (closed-panel copy shown by the focus fallback).
- [x] Language switcher accessible name names the target language: en "Switch language to: Ukrainian", uk
      "Перемкнути мову: англійська"; built with the visible code first ("UK. Switch language to: Ukrainian" /
      "EN. Перемкнути мову: англійська"), verified in the DOM (`aria-label`).
- [x] After a keyboard-activated switch, focus is on the switcher and a stale remembered switch (60 s) causes no focus
      move and no announcement (verified in Chrome).
- [x] `lang` is `uk` on the visible `UK` text and `en` on the visible `EN` text (on the inner `<span>`).
- [ ] No hydration warning from the language switcher.
- [ ] Renders in `en` and `uk`, light and dark, mobile and desktop.
- [ ] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`. `pnpm
code-quality` and `pnpm build` passed after block 2; the final run belongs to the end of the feature.

## Tasks

1. [x] Block 1 (done): `LanguageSwitcher` with `Link`, the hash via `useSyncExternalStore` (`subscribeToHash`),
       `LanguageAnnouncer`, `lib/helpers/localeSwitch.ts`, messages, desktop placement in `Header`. Verified in Chrome: navigation
       type, layout remount, `<html lang>`, cookie with and without JavaScript, hash both ways, live region content.
       `pnpm code-quality` and `pnpm build` pass. Left open: anchor landing (no `career` element yet), real screen
       reader, full-document load, a placeholder page.
   - [x] Follow-up after review (done): one `localeSwitch` key with `{hash, at}` and a 10 s expiry; remember only on
         a plain left click; `LanguageAnnouncer` restores the hash with `replaceState`, focuses the visible switcher
         and announces; the label starts with the visible code; SCSS uses `var(--transition-base)`. Verified in
         Chrome. `pnpm code-quality` and `pnpm build` passed after these changes; the final run belongs to the end
         of the feature.
2. [x] Block 2 (done): `<LanguageSwitcher />` in the `BurgerMenu` children after `ThemeSwitcher`; `LanguageAnnouncer`
       focus fallback to the menu toggle. Verified in Chrome at about 844px: accessibility tree order, one exposed
       copy, real click closes the panel, hash and theme kept, announcement, focus on the toggle, scroll lock
       released. The desktop breakpoint was confirmed by the author. `pnpm code-quality` and `pnpm build` passed.
3. Block 3: manual check (keyboard focus ring: done by the author; real screen reader and full-document load: deferred), then spec sync and update of
   [header.md](header.md). The theme part (label, toggle, theme kept across a switch) is in
   [theme-switcher.md](theme-switcher.md).
4. Cleanup by the author: delete the leftover folder `app/src/lib/locale-switch/` (`index.ts`, `localeSwitch.ts`): the
   helpers moved to `lib/helpers/` and nothing imports the old folder (the agent cannot delete files).

## Open questions

- Resolved: focus after the layout remount (returned to the visible switcher by `LanguageAnnouncer`; D14). For the
  burger copy, focus goes to the menu toggle and the hash is kept (block 2).
- Resolved: the layout jump on a language switch is accepted as natural (author's decision; Design, "Layout
  differences between locales").
- Resolved: keyboard focus ring on the burger copy and on both locales and themes, checked manually by the author.
- Does the hash land on the section (Lenis and the anchor behaviour)? Check when the section with the anchor id
  exists.
- Deferred (author's decision): the announcement in a full-document load and with a real screen reader; not tested, to be done in a separate stage.
- The old folder `lib/locale-switch/` is an unreferenced leftover (no imports anywhere); the author deletes it.
