import {LaunchIcon} from '@sanity/icons/Launch'
import {defineField, defineType} from 'sanity'
import {sectionGroups, sectionPreview} from '../lib/sectionFields'

export const ctaSectionType = defineType({
  name: 'ctaSection',
  title: 'Call to action',
  type: 'object',
  icon: LaunchIcon,
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
      name: 'tagline',
      type: 'internationalizedArrayString',
      group: 'content',
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
  preview: sectionPreview('Call to action'),
})
