import {BarChartIcon} from '@sanity/icons/BarChart'
import {defineField, defineType} from 'sanity'
import {baseText, requiredInBaseLanguage} from '../lib/localized'

export const metricType = defineType({
  name: 'metric',
  title: 'Metric',
  type: 'document',
  icon: BarChartIcon,
  fields: [
    defineField({
      name: 'value',
      type: 'string',
      description: 'For example: 4+',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      type: 'internationalizedArrayString',
      validation: requiredInBaseLanguage,
    }),
  ],
  preview: {
    select: {
      value: 'value',
      label: 'label',
    },
    prepare: ({value, label}) => ({
      title: value,
      subtitle: baseText(label),
    }),
  },
})
