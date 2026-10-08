import {PlayIcon} from '@sanity/icons/Play'
import {defineField, defineType} from 'sanity'
import {baseText, requiredInAllLanguages} from '../lib/localized'

// An interactive demo in the playground section; `componentKey` picks the client component in Next.
export const pieceType = defineType({
  name: 'piece',
  title: 'Playground piece',
  type: 'document',
  icon: PlayIcon,
  fields: [
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
