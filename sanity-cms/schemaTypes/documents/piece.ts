import {PlayIcon} from '@sanity/icons/Play'
import {defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {baseText, requiredInAllLanguages} from '../lib/localized'

// An interactive demo in the playground section; `componentKey` picks the client component in Next.
export const pieceType = defineType({
  name: 'piece',
  title: 'Playground piece',
  type: 'document',
  icon: PlayIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({type: 'piece'}),
    defineField({
      name: 'title',
      type: 'internationalizedArrayString',
      validation: requiredInAllLanguages,
    }),
    defineField({
      name: 'hint',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'componentKey',
      type: 'string',
      options: {
        list: [
          {
            title: 'Animated card',
            value: 'animatedCard',
          },
          {
            title: 'Form validation',
            value: 'formValidation',
          },
          {
            title: 'Theme switcher',
            value: 'themeSwitcher',
          },
          {
            title: 'Responsive design',
            value: 'responsiveDesign',
          },
        ],
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      componentKey: 'componentKey',
    },
    prepare: ({title, componentKey}) => ({
      title: baseText(title) ?? 'Playground piece',
      subtitle: componentKey,
    }),
  },
})
