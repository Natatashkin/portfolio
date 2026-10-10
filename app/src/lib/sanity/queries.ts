import { defineQuery } from 'next-sanity';

// Document types the page query reads. Each one becomes a cache tag on the
// fetch, so editing any of them revalidates the page. Extend it together with
// the query when a section starts dereferencing another document type.
export const PAGE_QUERY_TAGS = ['page'] as const;
export const SITE_SETTING_QUERY_TAGS = ['site-settings'] as const;

// Localized fields are written out literally: TypeGen reads queries
// statically and cannot infer types through interpolated strings.
// Items are matched by `language` (`_key` is a random id). An empty `locale`
// value falls back to `en`, not only a missing one.
export const PAGE_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    _id,
    sections[]{
      _key,
      _type,
      anchorId,
      _type == "heroSection" => {
        role,
        "fullname": select(
          defined(fullname[language == $locale][0].value) &&
            fullname[language == $locale][0].value != "" =>
            fullname[language == $locale][0].value,
          fullname[language == "en"][0].value
        ),
        "tagline": select(
          defined(tagline[language == $locale][0].value) &&
            tagline[language == $locale][0].value != "" =>
            tagline[language == $locale][0].value,
          tagline[language == "en"][0].value
        )
      }
    }
  }
`);

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0] {
    siteName,
    "name": select(
      defined(name[language == $locale][0].value) && 
        name[language == $locale][0].value != "" => 
        name[language == $locale][0].value, 
        name[language == "en"][0].value
      ),
    "navigation": navigation[] {
      _key,
      "label": select(
        defined(label[language == $locale][0].value) &&
          label[language == $locale][0].value != "" => 
          label[language == $locale][0].value,
          label[language == "en"][0].value
        ),
      url,
      isAnchor
    },
    "socialLinks": socialLinks[] {
      _key, label, url
    },
    "copyright": select(
      defined(copyright[language == $locale][0].value) && 
        copyright[language == $locale][0].value != "" => 
        copyright[language == $locale][0].value, 
        copyright[language == "en"][0].value
      ),
    "backToTopLabel": select(
      defined(backToTopLabel[language == $locale][0].value) && 
        backToTopLabel[language == $locale][0].value != "" => 
        backToTopLabel[language == $locale][0].value, 
        backToTopLabel[language == "en"][0].value
      ),
    "location": select(
      defined(location[language == $locale][0].value) && 
        location[language == $locale][0].value != "" => 
        location[language == $locale][0].value, 
        location[language == "en"][0].value
      ),
  }
`);
