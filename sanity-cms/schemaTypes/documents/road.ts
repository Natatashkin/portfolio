import {TrendUpwardIcon} from '@sanity/icons/TrendUpward'
import {defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {baseText, requiredInAllLanguages} from '../lib/localized'

// One step of the career path shown in the career section.
export const roadType = defineType({
  name: 'road',
  title: 'Career step',
  type: 'document',
  icon: TrendUpwardIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({type: 'road'}),
    defineField({
      name: 'period',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'title',
      type: 'internationalizedArrayString',
      validation: requiredInAllLanguages,
    }),
    defineField({
      name: 'description',
      type: 'internationalizedArrayString',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      period: 'period',
    },
    prepare: ({title, period}) => ({
      title: baseText(title) ?? 'Career step',
      subtitle: baseText(period),
    }),
  },
})
