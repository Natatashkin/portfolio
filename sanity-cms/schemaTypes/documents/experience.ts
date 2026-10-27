import {CaseIcon} from '@sanity/icons/Case'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {DATE_OPTIONS} from '../lib/constants'
import {formatDate} from '../lib/helpers'
import {baseText, requiredInAllLanguages} from '../lib/localized'

// Sanity passes the document untyped; read its string fields through one guard.
const stringField = (document: unknown, name: string): string | undefined => {
  if (typeof document !== 'object' || document === null) return undefined
  const value: unknown = Reflect.get(document, name)
  return typeof value === 'string' ? value : undefined
}

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
      name: 'companyDescription',
      title: 'Company description',
      type: 'internationalizedArrayRichText',
    }),
    defineField({
      name: 'entries',
      title: 'Experience entries',
      type: 'array',
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
      validation: (rule) => rule.required().min(1),
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
