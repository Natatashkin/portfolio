import {CaseIcon} from '@sanity/icons/Case'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {DATE_OPTIONS} from '../lib/constants'
import {formatDate} from '../lib/helpers'
import {baseText, requiredInAllLanguages} from '../lib/localized'

const EXPERIENCE_TYPES = [
  {title: 'Primary', value: 'primary'},
  {title: 'Secondary', value: 'secondary'},
] as const

// Sanity passes the document untyped; read the start date through one guard.
const startOf = (document: unknown): string | undefined =>
  typeof document === 'object' &&
  document !== null &&
  'periodStart' in document &&
  typeof document.periodStart === 'string'
    ? document.periodStart
    : undefined

export const experienceType = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'company',
      type: 'internationalizedArrayString',
      validation: requiredInAllLanguages,
    }),
    defineField({
      name: 'experienceType',
      title: 'Experience type',
      type: 'string',
      options: {
        list: [...EXPERIENCE_TYPES],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      type: 'internationalizedArrayString',
      validation: requiredInAllLanguages,
    }),
    defineField({
      name: 'periodStart',
      type: 'date',
      options: DATE_OPTIONS,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'periodEnd',
      type: 'date',
      options: DATE_OPTIONS,
      description: 'Leave empty for the current position.',
      validation: (rule) =>
        rule.custom((end, context) => {
          const start = startOf(context.document)
          return end && start && end < start ? 'End date must not be before the start date' : true
        }),
    }),
    defineField({
      name: 'descriptionPreview',
      title: 'Description preview',
      type: 'internationalizedArrayRichText',
      validation: requiredInAllLanguages,
    }),
    defineField({
      name: 'description',
      type: 'internationalizedArrayRichText',
      validation: requiredInAllLanguages,
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
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'periodStartDesc',
      by: [
        {
          field: 'periodStart',
          direction: 'desc',
        },
      ],
    },
  ],
  preview: {
    select: {
      company: 'company',
      start: 'periodStart',
      end: 'periodEnd',
    },
    prepare: ({company, start, end}) => ({
      title: baseText(company),
      subtitle: start && `${formatDate(start)} – ${end ? formatDate(end) : 'present'}`,
    }),
  },
})
