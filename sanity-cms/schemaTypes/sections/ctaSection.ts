import {LaunchIcon} from '@sanity/icons/Launch'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {sectionGroups, sectionPreview} from '../lib/sectionFields'

type CtaSectionValue = {
  hasBackground?: boolean
}

// Sanity passes the parent object untyped; read it through one helper.
const ctaSectionOf = (parent: unknown) => parent as CtaSectionValue | undefined

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
    // Optional: sections saved before these fields existed have no value, and the frontend treats a missing
    // `hasBackground` and `isFullWidth` as false and a missing `layout` as `row`.
    defineField({
      name: 'hasBackground',
      title: 'Show background',
      type: 'boolean',
      group: 'media',
      initialValue: false,
    }),
    defineField({
      name: 'cover',
      type: 'responsiveImage',
      group: 'media',
      hidden: ({parent}) => !ctaSectionOf(parent)?.hasBackground,
    }),
    // The main action stands apart from the secondary ones in the layout (right column or last in the row).
    defineField({
      name: 'ctaButton',
      title: 'CTA button',
      type: 'linkButton',
      group: 'actions',
    }),
    defineField({
      name: 'buttons',
      title: 'Additional buttons',
      type: 'array',
      group: 'actions',
      of: [defineArrayMember({type: 'linkButton'})],
    }),
    defineField({
      name: 'layout',
      type: 'string',
      group: 'settings',
      options: {
        list: [
          {
            title: 'Row',
            value: 'row',
          },
          {
            title: 'Column, centered',
            value: 'column-centered',
          },
        ],
      },
      initialValue: 'row',
    }),
    defineField({
      name: 'isFullWidth',
      title: 'Full width',
      type: 'boolean',
      group: 'settings',
      initialValue: false,
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
