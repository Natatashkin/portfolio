import {ProjectsIcon} from '@sanity/icons/Projects'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {baseText, requiredInBaseLanguage} from '../lib/localized'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ProjectsIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'internationalizedArrayString',
      validation: requiredInBaseLanguage,
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
    }),
    defineField({
      name: 'image',
      type: 'responsiveImage',
    }),
    defineField({
      name: 'technologies',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'technology'}],
        }),
      ],
    }),
    defineField({
      name: 'repoUrl',
      title: 'Repository URL',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live URL',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'link',
      type: 'linkButton',
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
