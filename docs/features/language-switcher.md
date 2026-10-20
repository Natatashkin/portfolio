# Language switcher

Status: done, with caveats: the deferred checks are listed in Open questions

## Goal

The visitor switches the page between Ukrainian and English from the header with one control.

## Requirements

- [x] One control that shows the text `EN` or `UK`: the language the visitor would switch **to** (on `uk` it shows `EN`,
      on `en` it shows `UK`). The label is fixed in code (the target locale uppercased) and is not localized; it is
      never taken from `messages/`.
- [x] The control is a `Link` (navigation, crawlable) that opens the same page in the other locale. Without
      JavaScript it is a real link to the other locale's URL. The `href` has an explicit locale prefix, also for the
      default locale (`/en` on `uk`); the proxy redirects `/en` to `/`.
- [x] Desktop (from `lg`, 1024px): in the header next to the theme switcher (`header__controls`).
- [x] Burger menu (below `lg`): in the top row of the panel next to the theme switcher, centred, with a line under the
      row and the navigation below it (`header__menuControls`, see [header.md](header.md)). Using it closes the panel
      (the panel closes on any click on an `<a>` inside it).
- [x] The `#hash` of the URL is kept on switch (`/#career` -> `/uk#career` and back).
- [x] After switching, a screen reader announces the change of page language in the **new** page language, for soft
      and full navigation. Built as a live region outside React.
- [x] After switching, keyboard focus returns to the visible switcher instead of being lost to `<body>` (D14).
- [x] The accessible name names the **target** language in the page language and starts with the visible code
      (WCAG 2.5.3): "UK. Switch language to: Ukrainian" (en) / "EN. Перемкнути мову: англійська" (uk), an
      `aria-label` localized in `messages/{en,uk}.json` (`LanguageSwitcher.label`).
- [x] The visible label text carries `lang` on the inner `<span>` (`<span lang="uk">UK</span>`). Limit: because the
      link has an `aria-label`, the name is taken from the label, so `lang` marks the visible text only; the code at
      the start of the name is read in the page language.
- [x] Keyboard-operable. Keyboard focus shows an underline that grows from the centre (`muted-control`, shared with the
      theme switcher, instead of the focus ring); a transparent 2px outline stays so forced-colors mode still shows it.
- [x] Same look and target size as the theme switcher: muted text with the `DotIcon` on the right.

## Design

### Locale routing

- `routing` has `locales: ['en', 'uk']`, `defaultLocale: 'en'`, `localePrefix: 'as-needed'`: English has no prefix,
  Ukrainian is under `/uk`. `navigation.ts` exports the locale-aware `Link`, `usePathname` and `useRouter`.
- `usePathname` returns the path without the locale prefix, so `<Link href={pathname} locale={target}>` builds an
  explicit prefix even for the default locale. The path is kept; only the home page exists today.
- Target locale: `routing.locales.find((item) => item !== locale)` with `useLocale()`. With two locales this is
  unambiguous; a third locale would need a different control.

### Locale cookie

- With JavaScript, `Link` with a different `locale` renders next-intl's `LocaleChangingLink`, whose `onClick` writes
  the `NEXT_LOCALE` cookie (the Next router cache can skip the server request, so the cookie is synced on the client).
- Without JavaScript the proxy sets the cookie on the response for the new path, only for document requests.
- The proxy uses next-intl defaults, so `Accept-Language` detection at `/` stays on. The cookie is what keeps a
  visitor on English after choosing it: without it `/` with `Accept-Language: uk` redirects to `/uk`.

### Navigation behaviour

- There is a single root layout, `app/src/app/[locale]/layout.tsx`, with a dynamic `locale` param, and it renders
  `<html lang={locale}>`.
- The locale switch is a **soft navigation**: no document reload, `<html lang>` is updated, Lenis keeps working.
- The whole locale layout subtree is **remounted** (the dynamic segment key changes): the header and live-region DOM
  nodes are replaced. React state cannot carry anything across the switch; what must survive goes through
  `sessionStorage` (D14 in [../decisions.md](../decisions.md)). Scroll resets to 0.

### Hash, focus and announcement

- `usePathname` and `Link href` carry no hash. The hash is read on the client from `window.location.hash` and
  appended to the `href`, without a hydration mismatch: `useSyncExternalStore` with an empty server snapshot, the
  subscription named `subscribeToHash` (it listens to `hashchange`).
- Appending the hash is not enough: the soft navigation goes through `/en` and the proxy redirect to `/`, which drops
  it. So `onClick` stores `{hash, at}` in `sessionStorage` (key `localeSwitch`, helpers in `lib/helpers/localeSwitch.ts`),
  only for a plain left click (not `defaultPrevented`, button 0, no modifier keys), so a modified click that opens a
  new tab leaves no flag.
- `LanguageAnnouncer` (`components/ui/LanguageAnnouncer/`, rendered in `[locale]/layout.tsx`) renders nothing and does
  all post-switch work after a 150 ms timer, so the remounted layout settles, and only if `takeLocaleSwitch()` returns
  a fresh switch (it reads and clears the key; absent, malformed or older than 10 s gives `null`, so a stale flag
  causes no announcement and no focus move):
  1. when the remembered hash is not empty and the URL has none (the redirect dropped it), restore it with
     `history.replaceState(history.state, '', path + search + hash)`, which keeps Next's history state and adds no
     history entry, then `scrollIntoView` on the element with that id if it exists;
  2. focus the visible switcher (`findFocusTarget()`) with `focus({ preventScroll: true })`, because the remount
     dropped focus to `<body>` and the scroll position is already settled by step 1;
  3. empty the live region and, in the next tick, set `LanguageSwitcher.announcement` in the new language, so a
     repeated switch to the same language is a real text change.
- The live region is one visually hidden `role="status"` element created in `document.body` **outside React**
  (fixed id `language-announcer`), because a React-owned region is replaced when the layout remounts and its text is
  lost.
- `findFocusTarget()` picks the first `[data-language-switcher]` that is visible (not inside a `[data-open="false"]`
  panel, and `checkVisibility({ visibilityProperty: true })` is true, or `getClientRects().length > 0` where
  `checkVisibility` is missing). When only the burger copy exists and the panel is closed, it focuses the menu toggle
  (`[data-menu-toggle]` on the `BurgerMenu` button).
- Dev only: the switch is read inside the timer because Strict Mode runs the effect twice and the first run's timer is
  cleared; the effect cleanup clears both timers.

### Accessible names and message keys

- `LanguageSwitcher.label`: the accessible-name pattern from Requirements, with `{code}` (the visible code) and
  `{language}` (the target language named in the page language).
- `LanguageSwitcher.announcement` (`{language}`): "Language changed to: English" / "Мову змінено: українська".
- `LanguageSwitcher.languages.{en,uk}`: the language names substituted for `{language}`.
- `EN` / `UK` are constants in code, not in `messages/`.

### Hreflang

The proxy sets next-intl's alternate-links `Link` response header on non-redirect responses, with an `x-default`
entry. The `<head>` hreflang tags (en -> `/`, uk -> `/uk`, x-default -> `/`) are **not implemented**; they belong to
the "Page metadata and SEO" feature and are on the Launch checklist in [../roadmap.md](../roadmap.md). `hrefLang` on
the switcher `Link` (set by next-intl) is only an additional hint.

### Interaction with the theme

The chosen theme survives the layout remount; see [theme-switcher.md](theme-switcher.md).

### Duplicates in desktop row and burger menu

`Header` renders the switchers twice: in `header__desktop` and as `BurgerMenu` children. Below `lg` the desktop row is
`display: none`; from `lg` the whole burger block is `display: none`; in a closed panel the other copy is
`visibility: hidden` (flipped after a 250 ms delay on close). These are removed from the accessibility tree and the
tab order, so exactly one copy is reachable at a time. No `inert` or `aria-hidden` is set.

### UI and server/client split

- `LanguageSwitcher` (`components/ui/LanguageSwitcher/`): a small client component (`useLocale`, `usePathname`, the
  hash store, a click handler), no React state. It carries `data-language-switcher` so the announcer can find it.
- `LanguageAnnouncer`: client component that renders nothing.
- `lib/helpers/localeSwitch.ts`: `rememberLocaleSwitch(hash)` and `takeLocaleSwitch()` over one key, exported through
  the `lib/helpers` barrel. A storage failure is swallowed: the switch still works, only the hash, focus and
  announcement are skipped.
- `Header` stays a Server Component; the two switchers sit in one group (`header__controls`) to stay together on the
  right.
- **Edge cases:** an unknown locale never reaches the header (the layout calls `notFound()`).

## Files

- `app/src/components/ui/LanguageSwitcher/`: `Link` to the other locale (`LanguageSwitcher.tsx`, `.module.scss`,
  `index.ts`).
- `app/src/components/ui/LanguageAnnouncer/`: live region outside React plus post-switch hash, focus and announcement;
  rendered in `app/src/app/[locale]/layout.tsx`.
- `app/src/lib/helpers/localeSwitch.ts`: `sessionStorage` helpers for the remembered switch.
- `app/src/components/layout/Header/Header.tsx` and `Header.module.scss`: both placements.
- `app/messages/en.json`, `uk.json`: `LanguageSwitcher` strings.

## Acceptance criteria

- [x] On `/` the control shows `UK` and leads to `/uk`; on `/uk` it shows `EN` and leads to `/`.
- [x] `NEXT_LOCALE` is set after a switch, with and without JavaScript.
- [x] The `#hash` is kept in both directions, also from the burger copy.
- [x] The language change is announced in the new page language after a soft navigation.
- [x] After a keyboard-activated switch focus is on the switcher; a stale remembered switch causes no focus move and
      no announcement.
- [x] One copy of each switcher is reachable at a time on both sides of `lg`; the burger panel closes after a switch.
- [x] No hydration warning from the language switcher.
- [x] Renders in `en` and `uk`, light and dark, mobile and desktop.
- [x] `pnpm format`, `pnpm code-quality` (no circular dependencies) and `pnpm build` pass in `app/`.

## Tasks

Done in the code.

## Open questions

Deferred checks:

- Landing on the section by `#hash`: the hash is restored in the URL and `scrollIntoView` is in the code, but it is
  untested because no section has an anchor id yet; how Lenis handles it is also unchecked.
- The target URL from the current pathname on a second page (`/projects` <-> `/uk/projects`): deferred until such a
  page exists.
- The announcement after a full document load and with a real screen reader: deferred.
