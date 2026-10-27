import {DocumentsIcon} from '@sanity/icons/Documents'
import {defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

// A file offered for download, one version per language. A button picks the document and the language.
export const downloadDocumentType = defineType({
  name: 'downloadDocument',
  title: 'Documents',
  type: 'document',
  icon: DocumentsIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({type: 'downloadDocument'}),
    defineField({
      name: 'title',
      type: 'string',
      description: 'Internal name, for example: CV',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'files',
      type: 'object',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'file',
          options: {accept: 'application/pdf'},
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'uk',
          title: 'Українська',
          type: 'file',
          options: {accept: 'application/pdf'},
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title'},
  },
})
