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
        "headline": select(
          defined(headline[language == $locale][0].value) &&
            count(headline[language == $locale][0].value) > 0 =>
            headline[language == $locale][0].value,
          headline[language == "en"][0].value
        ),
        "description": select(
          defined(description[language == $locale][0].value) &&
            count(description[language == $locale][0].value) > 0 =>
            description[language == $locale][0].value,
          description[language == "en"][0].value
        ),
        "quote": select(
          defined(quote[language == $locale][0].value) &&
            quote[language == $locale][0].value != "" =>
            quote[language == $locale][0].value,
          quote[language == "en"][0].value
        ),
        "stack": stack[defined(@->_id)]->{
          _id,
          _type,
          _type == "technology" => {
            name,
            iconKey
          },
          _type == "skill" => {
            iconKey,
            "title": select(
              defined(title[language == $locale][0].value) &&
                title[language == $locale][0].value != "" =>
                title[language == $locale][0].value,
              title[language == "en"][0].value
            )
          }
        },
        "image": image{
          desktop,
          mobile,
          "alt": select(
            defined(alt[language == $locale][0].value) &&
              alt[language == $locale][0].value != "" =>
              alt[language == $locale][0].value,
            alt[language == "en"][0].value
          )
        },
        "ctaButton": ctaButton{
          linkType,
          url,
          hasAnchor,
          anchor,
          variant,
          hasIcon,
          "label": select(
            defined(label[language == $locale][0].value) &&
              label[language == $locale][0].value != "" =>
              label[language == $locale][0].value,
            label[language == "en"][0].value
          )
        },
        "metrics": metrics[defined(@->_id)]->{
          _id,
          value,
          "label": select(
            defined(label[language == $locale][0].value) &&
              label[language == $locale][0].value != "" =>
              label[language == $locale][0].value,
            label[language == "en"][0].value
          )
        }
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
