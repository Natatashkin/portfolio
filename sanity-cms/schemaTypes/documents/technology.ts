import {CodeIcon} from '@sanity/icons/Code'
import {defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {filterSlugField} from '../lib/filterSlug'

export const technologyType = defineType({
  name: 'technology',
  title: 'Technology',
  type: 'document',
  icon: CodeIcon,
  orderings: [
    orderRankOrdering,
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
  fields: [
    orderRankField({type: 'technology'}),
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    filterSlugField('name'),
    defineField({
      name: 'iconKey',
      type: 'string',
      description: 'Optional. Icon name from the site code; unknown keys show no icon.',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'iconKey',
    },
  },
})
