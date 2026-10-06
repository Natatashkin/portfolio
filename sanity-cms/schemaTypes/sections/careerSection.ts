import {TrendUpwardIcon} from '@sanity/icons/TrendUpward'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {sectionGroups, sectionPreview} from '../lib/sectionFields'

export const careerSectionType = defineType({
  name: 'careerSection',
  title: 'Career',
  type: 'object',
  icon: TrendUpwardIcon,
  groups: sectionGroups,
  fields: [
    defineField({
      name: 'eyebrow',
      type: 'internationalizedArrayString',
      group: 'content',
    }),
    defineField({
      name: 'headline',
      type: 'internationalizedArrayHeadline',
      group: 'content',
    }),
    defineField({
      name: 'description',
      type: 'internationalizedArrayRichText',
      group: 'content',
    }),
    defineField({
      name: 'steps',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'road'}],
        }),
      ],
    }),
    defineField({
      name: 'caption',
      type: 'internationalizedArrayString',
      group: 'content',
    }),
    defineField({
      name: 'tagline',
      type: 'internationalizedArrayString',
      group: 'content',
    }),
    defineField({
      name: 'image',
      type: 'responsiveImage',
      group: 'media',
    }),
    defineField({
      name: 'button',
      type: 'linkButton',
      group: 'actions',
    }),
    defineField({
      name: 'anchorId',
      title: 'Anchor ID',
      type: 'string',
      group: 'settings',
      description: 'Used by navigation links and in-page anchors, for example: projects',
      validation: (rule) => rule.regex(/^[a-z0-9-]+$/, {name: 'anchor ID'}),
    }),
  ],
  preview: sectionPreview('Career'),
})
