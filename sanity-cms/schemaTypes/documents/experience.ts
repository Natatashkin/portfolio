import {CaseIcon} from '@sanity/icons/Case'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {baseText} from '../lib/localized'

export const experienceType = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'company',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'periodStart',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'periodEnd',
      type: 'date',
      description: 'Leave empty for the current position.',
      validation: (rule) =>
        rule.custom((end, context) => {
          const start = (context.document as {periodStart?: string} | undefined)?.periodStart
          return end && start && end < start ? 'End date must be after the start date' : true
        }),
    }),
    defineField({
      name: 'description',
      type: 'internationalizedArrayRichText',
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
      role: 'role',
      start: 'periodStart',
      end: 'periodEnd',
    },
    prepare: ({company, role, start, end}) => ({
      title: company,
      subtitle: [baseText(role), start && `${start} – ${end ?? 'present'}`]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})
