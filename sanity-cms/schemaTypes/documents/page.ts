import {DocumentIcon} from '@sanity/icons/Document'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {baseText, requiredInBaseLanguage} from '../lib/localized'
import {sectionTypes} from '../sections/sectionTypes'

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {
      name: 'content',
      title: 'Content',
      default: true,
    },
    {
      name: 'seo',
      title: 'SEO',
    },
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'internationalizedArrayString',
      description: 'Page heading (h1) and breadcrumb label. Other languages fall back to English.',
      group: 'content',
      validation: requiredInBaseLanguage,
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'Use "home" for the home page.',
      // The slug is built from the English (base) title.
      options: {source: (document) => baseText(document.title) ?? ''},
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'internationalizedArrayRichText',
      group: 'content',
    }),
    defineField({
      name: 'sections',
      type: 'array',
      group: 'content',
      of: sectionTypes.map(({name}) => defineArrayMember({type: name})),
      options: {
        insertMenu: {
          views: [
            {
              name: 'grid',
              previewImageUrl: (type) => `/static/sections/${type}.svg`,
            },
            {name: 'list'},
          ],
        },
      },
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({
          name: 'title',
          type: 'internationalizedArrayString',
        }),
        defineField({
          name: 'description',
          type: 'internationalizedArrayText',
        }),
        defineField({
          name: 'ogImage',
          title: 'Open Graph image',
          type: 'image',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
    },
    prepare: ({title, subtitle}) => ({
      title: baseText(title) ?? 'Page',
      subtitle,
    }),
  },
})
