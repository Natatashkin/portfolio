import {ImageIcon} from '@sanity/icons/Image'
import {defineField, defineType} from 'sanity'
import {baseText, requiredInAllLanguages} from '../lib/localized'

export const responsiveImageType = defineType({
  name: 'responsiveImage',
  title: 'Responsive image',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'desktop',
      type: 'image',
      options: {hotspot: true},
      // Sanity validates hidden fields too; a hidden image (e.g. a CTA cover without background) must not block publish.
      validation: (rule) =>
        rule.custom((value, context) => (context.hidden || value?.asset ? true : 'Required')),
    }),
    defineField({
      name: 'mobile',
      type: 'image',
      description: 'Optional. Falls back to the desktop image.',
      options: {hotspot: true},
    }),
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'internationalizedArrayString',
      validation: requiredInAllLanguages,
    }),
  ],
  preview: {
    select: {
      alt: 'alt',
      media: 'desktop',
    },
    prepare: ({alt, media}) => ({
      title: baseText(alt) ?? 'Image',
      media,
    }),
  },
})
