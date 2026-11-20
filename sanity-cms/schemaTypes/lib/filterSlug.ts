import {defineField, getPublishedId, type SlugIsUniqueValidator, type SlugSourceFn} from 'sanity'

// The projects filter key: one `?filter=` value must name one chip, so a slug is unique across
// technologies and skills together, not per type (D31).
// Keep in sync with the document types that call `filterSlugField`.
const FILTER_SLUG_TYPES = ['technology', 'skill']

// Lowercase ASCII words joined by single hyphens; a URL value that reads the same in every locale.
const FILTER_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const isUniqueFilterSlug: SlugIsUniqueValidator = async (slug, {document, getClient}) => {
  if (!document?._id || !slug) return true

  // The date of the Sanity docs example this check follows; any version with `sanity::versionOf` works.
  const client = getClient({apiVersion: '2025-02-19'})

  // Every version of the edited document (draft, release) is excluded, so it never collides with itself.
  return client.fetch<boolean>(
    `!defined(*[
      _type in $types &&
      !sanity::versionOf($published) &&
      slug.current == $slug
    ][0]._id)`,
    {types: FILTER_SLUG_TYPES, published: getPublishedId(document._id), slug},
  )
}

export function filterSlugField(source: string | SlugSourceFn) {
  return defineField({
    name: 'slug',
    type: 'slug',
    description:
      'Filter key in the projects page URL, e.g. "next-js". Unique across technologies and skills.',
    options: {source, isUnique: isUniqueFilterSlug},
    validation: (rule) =>
      rule
        .required()
        .custom((value) =>
          !value?.current || FILTER_SLUG_PATTERN.test(value.current)
            ? true
            : 'Use lowercase latin letters, digits and single hyphens',
        ),
  })
}
