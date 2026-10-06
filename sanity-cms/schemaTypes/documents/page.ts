import {DocumentIcon} from '@sanity/icons/Document'
import {defineArrayMember, defineField, defineType} from 'sanity'
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
      type: 'string',
      description: 'Internal name, not shown on the site.',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'Use "home" for the home page.',
      options: {source: 'title'},
      group: 'content',
      validation: (rule) => rule.required(),
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
  },
})
