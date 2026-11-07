import {ProjectsIcon} from '@sanity/icons/Projects'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {baseText, requiredInAllLanguages} from '../lib/localized'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ProjectsIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({type: 'project'}),
    defineField({
      name: 'title',
      type: 'internationalizedArrayString',
      validation: requiredInAllLanguages,
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      // The slug is built from the English (base) title.
      options: {source: (document) => baseText(document.title) ?? ''},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      type: 'internationalizedArrayRichText',
      validation: requiredInAllLanguages,
    }),
    defineField({
      name: 'image',
      type: 'responsiveImage',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'technologies',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'technology'}, {type: 'skill'}],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'buttons',
      type: 'array',
      of: [defineArrayMember({type: 'linkButton'})],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      media: 'image.desktop',
    },
    prepare: ({title, slug, media}) => ({
      title: baseText(title) ?? 'Project',
      subtitle: slug,
      media,
    }),
  },
})
