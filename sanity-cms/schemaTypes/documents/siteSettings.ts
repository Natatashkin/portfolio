import {CogIcon} from '@sanity/icons/Cog'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {baseText, requiredInAllLanguages} from '../lib/localized'

// Singleton: the structure exposes a single document with the fixed ID `siteSettings`.
export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'siteName',
      type: 'string',
    }),
    defineField({
      name: 'name',
      type: 'internationalizedArrayString',
      validation: requiredInAllLanguages,
    }),
    defineField({
      name: 'role',
      type: 'string',
    }),
    defineField({
      name: 'navigation',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'navigationItem',
          type: 'object',
          initialValue: {
            isAnchor: false,
          },
          fields: [
            defineField({
              name: 'label',
              type: 'internationalizedArrayString',
              validation: requiredInAllLanguages,
            }),
            defineField({
              name: 'isAnchor',
              type: 'boolean',
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'string',
              description: 'Use letters and hyphens only, e.g. "about" or "my-project"',
              validation: (rule) => rule.required().regex(/^[a-z]+$/, {name: 'project link'}),
            }),
          ],
          preview: {
            select: {
              label: 'label',
              isAnchor: 'isAnchor',
              url: 'url',
            },
            prepare: ({label, isAnchor, url}) => ({
              title: baseText(label) ?? url,
              subtitle: isAnchor ? `#${url}` : `url: ${url}`,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'socialLinks',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'socialLink',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) => rule.required().uri({scheme: ['https', 'mailto', 'tel']}),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'url',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'location',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'copyright',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'backToTopLabel',
      title: 'Back-to-top label',
      type: 'internationalizedArrayString',
      validation: requiredInAllLanguages,
    }),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})
