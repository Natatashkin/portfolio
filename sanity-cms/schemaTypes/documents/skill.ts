import {BulbOutlineIcon} from '@sanity/icons/BulbOutline'
import {defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {baseText, requiredInAllLanguages} from '../lib/localized'

export const skillType = defineType({
  name: 'skill',
  title: 'Skill',
  type: 'document',
  icon: BulbOutlineIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({type: 'skill'}),
    defineField({
      name: 'title',
      type: 'internationalizedArrayString',
      validation: requiredInAllLanguages,
    }),
    defineField({
      name: 'description',
      type: 'internationalizedArrayText',
    }),
    defineField({
      name: 'iconKey',
      type: 'string',
      description: 'Optional. Icon name from the site code; unknown keys show no icon.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      iconKey: 'iconKey',
    },
    prepare: ({title, iconKey}) => ({
      title: baseText(title) ?? 'Skill',
      subtitle: iconKey,
    }),
  },
})
