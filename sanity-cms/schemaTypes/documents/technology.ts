import {CodeIcon} from '@sanity/icons/Code'
import {defineField, defineType} from 'sanity'

export const technologyType = defineType({
  name: 'technology',
  title: 'Technology',
  type: 'document',
  icon: CodeIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'iconKey',
      type: 'string',
      description: 'Optional. Icon name from the site code; unknown keys show no icon.',
    }),
  ],
  orderings: [
    {
      title: 'Name',
      name: 'nameAsc',
      by: [
        {
          field: 'name',
          direction: 'asc',
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'iconKey',
    },
  },
})
