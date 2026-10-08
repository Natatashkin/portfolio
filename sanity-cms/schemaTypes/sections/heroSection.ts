import {RocketIcon} from '@sanity/icons/Rocket'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {sectionGroups, sectionPreview} from '../lib/sectionFields'
import {requiredInAllLanguages} from '../lib/localized'

export const heroSectionType = defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  icon: RocketIcon,
  groups: sectionGroups,
  fields: [
    defineField({
      name: 'role',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'headline',
      type: 'internationalizedArrayHeadline',
      group: 'content',
    }),
    defineField({
      name: 'fullname',
      type: 'internationalizedArrayString',
      validation: requiredInAllLanguages,
      group: 'content',
    }),
    defineField({
      name: 'stack',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'technology'}, {type: 'skill'}],
        }),
      ],
    }),
    defineField({
      name: 'description',
      type: 'internationalizedArrayRichText',
      group: 'content',
    }),
    defineField({
      name: 'image',
      type: 'responsiveImage',
      group: 'media',
    }),
    defineField({
      name: 'quote',
      type: 'internationalizedArrayText',
      group: 'media',
    }),
    defineField({
      name: 'tagline',
      type: 'internationalizedArrayString',
      group: 'media',
    }),
    defineField({
      name: 'ctaButton',
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
  preview: sectionPreview('Hero'),
})
