# Content model

Source of truth: `sanity-cms/schemaTypes/`. This spec mirrors it; change the schema and this file together.

## Conventions

- **loc** = `sanity-plugin-internationalized-array` field (string, text, richText or headline), languages `en` (base)
  and `uk`. Not localized: names, dates, URLs, keys, images.
- GROQ matches items by `language` (the array `_key` is random) and falls back to `en` when the value is empty.
- Required loc fields must be filled in every language; the `en` fallback is only a safety net.
- Every section has field groups `content`, `media`, `actions`, `settings`; `settings` holds `anchorId`, used by
  navigation and in-page anchors.
- `iconKey` and `componentKey` are free strings; the app falls back to no icon / no demo for an unknown key.

How schemas are written (helpers, registration, tiles) is in
[../conventions.md](../conventions.md#sanity-schemas); link safety is in
[../conventions.md](../conventions.md#security).

## Blocks (object types)

| Block             | Fields                                                                                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `linkButton`      | `label` (loc string), `linkType` (internal \| external \| download), `url`, `download` {`document` (→ downloadDocument), `files` {`en`, `uk`}, one PDF per language |\| uk)} (`download` only), `hasAnchor`, `anchor`, `variant` (primary \| secondary \| accent), `hasIcon` |
| `responsiveImage` | `desktop` (required, hotspot), `mobile` (optional, falls back to desktop), `alt` (loc string)                                                                                                                                                     |
| `richText`        | Portable Text: normal style, bullets, `strong`, `em`, link annotation (`href`)                                                                                                                                                                    |
| `headline`        | Portable Text: one normal block, decorator `accent`, no lists or links                                                                                                                                                                            |

`linkButton` defaults for every new button: `linkType: internal`, `variant: primary`, `hasIcon: false`,
`hasAnchor: false`.

`linkButton` reading rules: external `url` is rendered only if it passes `safeHref` (otherwise no button,
see [../conventions.md](../conventions.md#security)); internal is a slash-less path (`about`, `projects/sub`), the
app adds the leading `/` and the locale prefix. `anchor` is read only when `hasAnchor` is true (Studio does not clear
it when the toggle is turned off). `download` renders `download.document->files[download.language].asset->url` as a download link,
whatever the site locale is; if the reference is broken or the document has no file in that language, no button
(deliberately silent). The app always keys off `linkType`, never off which fields are filled: Studio hides the fields
that do not apply but does not clear them, so `url` and `anchor` are ignored for `download`, and `download` is
ignored for the other two types. See
[../decisions.md](../decisions.md#d15-download-link-in-linkbutton).

## Validation rules (Studio)

| Field                            | Rule                                                                                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `linkButton.download`            | Visible only for `download`; `document` (reference to a `downloadDocument`) and `language` (`en` or `uk`) are both required |
| `downloadDocument.title`         | Required (internal name)                                                                                                                                                       |
| `downloadDocument.files`         | `en` required, `uk` optional; the upload picker accepts PDF only (`accept`) |
| `linkButton.url`                 | Hidden for `download`. Otherwise required. External: valid URL with `https`, `mailto` or `tel`. Internal: `^[a-z0-9]+(?:[-/][a-z0-9]+)*$` (case-insensitive), no leading slash |
| `linkButton.anchor`              | Visible and required only when `hasAnchor`. Letters and hyphens: `^[a-z]+(?:-[a-z]+)*$` (case-insensitive), no `#`, no digits                                                  |
| `<section>.anchorId`             | Optional. `^[a-z0-9-]+$` (digits allowed, unlike `linkButton.anchor`)                                                                                                          |
| `siteSettings.navigation[].url`  | Required. Lowercase letters only: `^[a-z]+$`                                                                                                                                   |
| `siteSettings.socialLinks[].url` | Required. `https`, `mailto` or `tel`                                                                                                                                           |
| `page.slug`                      | Required. Generated from the internal `title`; `home` is the landing                                                                                                           |
| `project.slug`                   | Required. Generated from the `en` (base) entry of the localized `title` via a source function                                                                                  |
| `piece.componentKey`             | One of `animatedCard`, `formValidation`, `themeSwitcher`, `responsiveDesign`                                                                                                   |
| `technology.name`                | Required                                                                                                                                                                       |

## Documents

Every document below except `siteSettings` and `page` also carries a hidden `orderRank` (Studio drag-and-drop order only, not queried by the
site).

| Document                                      | Fields                                                                                                                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `siteSettings` (singleton, id `siteSettings`) | `siteName`, `name` (loc), `navigation[]` {`label` loc, `isAnchor`, `url`}, `socialLinks[]` {`label`, `url`}, `location` (loc), `copyright` (loc), `backToTopLabel` (loc) |
| `downloadDocument` ("Documents" in Studio)    | `title` (internal name, e.g. "CV"), `files` {`en`, `uk`}, one PDF per language |
| `page`                                        | `title` (internal), `slug` (`home` = landing), `sections[]`, `seo` {`title` loc, `description` loc text, `ogImage`}                                                      |
| `metric`                                      | `value` (string, e.g. "4+"), `label` (loc)                                                                                                                               |
| `road`                                        | `period` (loc string), `title` (loc string), `description` (loc text, optional); `period` and `title` are required                                                       |
| `skill`                                       | `title` (loc), `iconKey`                                                                                                                                                 |
| `piece`                                       | `title`, `hint` (loc), `componentKey` (list; maps to a client demo)                                                                                                      |
| `technology`                                  | `name`, `iconKey`                                                                                                                                                        |
| `project`                                     | `title` (loc), `slug` (from `en` title), `summary` (loc richText), `image`, `technologies[]` → technology, `repoUrl`, `liveUrl`, `link` (linkButton)                     |
| `experience`                                  | `company`, `role` (loc), `periodStart`, `periodEnd`, `companyDescription` (loc richText), `entries[]`                                                                    |

`experience`: `company`, `role`, `periodStart` and `entries[]` (at least one) are required; `periodEnd` and
`companyDescription` are optional. Dates are entered as `DD-MM-YYYY` and stored as ISO; an empty `periodEnd` means the
current position. Every document has the same shape, there are no conditional fields. An entry holds `title`
(loc string, required), `technologies[]` → technology or skill (optional) and `description` (loc richText, required).

## Sections (`page.sections`)

| Section             | Fields                                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `heroSection`       | `role`, `fullname` (loc), `headline`, `description`, `stack[]` → technology \| skill, `image`, `quote` (loc text), `metrics[]` → metric, `ctaButton` |
| `careerSection`     | `eyebrow`, `headline`, `description`, `steps[]` → road, `tagline`, `cover`, `buttons[]` (linkButton)                                                 |
| `whatIDoSection`    | `eyebrow`, `headline`, `description`, `skills[]` → skill, `button`                                                                                   |
| `playgroundSection` | `eyebrow`, `headline`, `description`, `pieces[]` → piece, `button`                                                                                   |
| `projectsSection`   | `eyebrow`, `headline`, `description`, `projects[]` → project, `button`                                                                               |
| `experienceSection` | `eyebrow`, `headline`, `description`, `experiences[]` → experience, `button`                                                                         |
| `techStackSection`  | `eyebrow`, `headline`, `description`, `technologies[]` → technology, `moreLabel`                                                                     |
| `ctaSection`        | `eyebrow`, `headline`, `description`, `tagline`, `button`                                                                                            |

Text fields in sections are loc unless noted. Plain (non-localized) strings: `heroSection.role`, `siteSettings.siteName`,
`technology.name`, `metric.value`. Implementation status per section:
[../features/README.md](../features/README.md).

## Adding or changing a section

Follow the `new-section` skill (`.claude/skills/new-section/SKILL.md`); schema rules are in
[../conventions.md](../conventions.md#sanity-schemas). Update this file whenever a schema changes.
