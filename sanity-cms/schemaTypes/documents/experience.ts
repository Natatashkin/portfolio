import {CaseIcon} from '@sanity/icons/Case'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {DATE_OPTIONS} from '../lib/constants'
import {formatDate} from '../lib/helpers'
import {baseText, requiredInAllLanguages} from '../lib/localized'

const EXPERIENCE_TYPES = [
  {title: 'Primary', value: 'primary'},
  {title: 'Secondary', value: 'secondary'},
] as const

// Sanity passes the document untyped; read its string fields through one guard.
const stringField = (document: unknown, name: string): string | undefined => {
  if (typeof document !== 'object' || document === null) return undefined
  const value: unknown = Reflect.get(document, name)
  return typeof value === 'string' ? value : undefined
}

const isPrimary = (document: unknown) => stringField(document, 'experienceType') === 'primary'
const isSecondary = (document: unknown) => stringField(document, 'experienceType') === 'secondary'

export const experienceType = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  icon: CaseIcon,
  orderings: [
    orderRankOrdering,
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
  fields: [
    orderRankField({type: 'experience'}),
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
      name: 'company',
      type: 'internationalizedArrayString',
      validation: requiredInAllLanguages,
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
          const start = stringField(context.document, 'periodStart')
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
      name: 'companyDescription',
      title: 'Company description',
      type: 'internationalizedArrayRichText',
    }),
    defineField({
      name: 'entries',
      title: 'Experience entries',
      type: 'array',
      hidden: ({document}) => !isPrimary(document),
      of: [
        defineArrayMember({
          name: 'experienceEntry',
          title: 'Experience entry',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              type: 'internationalizedArrayString',
              validation: requiredInAllLanguages,
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
            }),
            defineField({
              name: 'description',
              type: 'internationalizedArrayRichText',
              validation: requiredInAllLanguages,
            }),
          ],
          preview: {
            select: {title: 'title'},
            prepare: ({title}) => ({title: baseText(title) ?? 'Experience entry'}),
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((entries, context) =>
          isPrimary(context.document) && !entries?.length ? 'Add at least one entry' : true,
        ),
    }),
    defineField({
      name: 'description',
      type: 'internationalizedArrayRichText',
      hidden: ({document}) => !isSecondary(document),
    }),
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
