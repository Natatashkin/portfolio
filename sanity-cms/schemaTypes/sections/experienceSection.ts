import {CaseIcon} from '@sanity/icons/Case'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {sectionGroups, sectionPreview} from '../lib/sectionFields'

export const experienceSectionType = defineType({
  name: 'experienceSection',
  title: 'Experience',
  type: 'object',
  icon: CaseIcon,
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
      name: 'experiences',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'experience'}],
        }),
      ],
    }),
    defineField({
      name: 'buttons',
      type: 'array',
      group: 'actions',
      of: [defineArrayMember({type: 'linkButton'})],
    }),
    defineField({
      name: 'anchorId',
      title: 'Anchor ID',
      type: 'string',
      group: 'settings',
      description: 'Used by navigation links and in-page anchors, for example: experience',
      validation: (rule) => rule.regex(/^[a-z0-9-]+$/, {name: 'anchor ID'}),
    }),
  ],
  preview: sectionPreview('Experience'),
})
