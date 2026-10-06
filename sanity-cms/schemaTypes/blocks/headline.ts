import {HighlightIcon} from '@sanity/icons/Highlight'
import {defineArrayMember, defineType} from 'sanity'

// A big section title: one paragraph with an optional highlighted ("accent") part.
export const headlineType = defineType({
  name: 'headline',
  title: 'Headline',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {
          title: 'Normal',
          value: 'normal',
        },
      ],
      lists: [],
      marks: {
        decorators: [
          {
            title: 'Accent',
            value: 'accent',
            icon: HighlightIcon,
          },
        ],
        annotations: [],
      },
    }),
  ],
  validation: (rule) => rule.max(1),
})
