import {BarChartIcon} from '@sanity/icons/BarChart'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {sectionGroups} from '../lib/sectionFields'

export const metricsSectionType = defineType({
  name: 'metricsSection',
  title: 'Metrics',
  type: 'object',
  icon: BarChartIcon,
  groups: sectionGroups,
  fields: [
    defineField({
      name: 'metrics',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'metric'}],
        }),
      ],
    }),
    defineField({
      name: 'anchorId',
      title: 'Anchor ID',
      type: 'string',
      group: 'settings',
      description: 'Used by navigation links and in-page anchors, for example: projects',
      validation: (rule) => rule.regex(/^[a-z0-9-]+$/, {name: 'anchor ID'}),
    }),
  ],
  preview: {
    select: {metrics: 'metrics'},
    prepare: ({metrics}) => ({
      title: 'Metrics',
      subtitle: Array.isArray(metrics) ? `${metrics.length} metrics` : undefined,
    }),
  },
})
