import {LinkIcon} from '@sanity/icons/Link'
import {ConditionalDescription} from '../../components/ConditionalDescription'
import {createElement} from 'react'
import {defineField, defineType} from 'sanity'
import {LANGUAGES} from '../lib/languages'
import {baseText, requiredInAllLanguages} from '../lib/localized'

const LINK_TYPES = [
  {title: 'Internal', value: 'internal'},
  {title: 'External', value: 'external'},
  {title: 'Download', value: 'download'},
] as const

type LinkButtonValue = {
  linkType?: (typeof LINK_TYPES)[number]['value']
  hasAnchor?: boolean
}

// Sanity passes the parent object untyped; read it through one helper.
const linkButtonOf = (parent: unknown) => parent as LinkButtonValue | undefined

const isDownload = (parent: unknown) => linkButtonOf(parent)?.linkType === 'download'

export const linkButtonType = defineType({
  name: 'linkButton',
  title: 'Link button',
  type: 'object',
  icon: LinkIcon,
  // Defaults for every new button, wherever it is created (document, section, array item).
  initialValue: {
    linkType: 'internal',
    variant: 'primary',
    hasIcon: false,
    hasAnchor: false,
  },
  fields: [
    defineField({
      name: 'label',
      type: 'internationalizedArrayString',
      validation: requiredInAllLanguages,
    }),
    defineField({
      name: 'linkType',
      title: 'Link type',
      type: 'string',
      options: {
        list: [...LINK_TYPES],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'url',
      title: 'URL',
      // `string`, not `url`: the built-in url type rejects internal paths ("about"); the rules below cover both link types.
      type: 'string',
      components: {
        field: (props) =>
          createElement(ConditionalDescription, {
            ...props,
            conditionField: 'linkType',
            descriptions: {
              internal: 'Enter an internal path, e.g. about or projects',
              external: 'Enter a full URL, e.g. https://example.com',
            },
          }),
      },
      hidden: ({parent}) => isDownload(parent),
      validation: (rule) =>
        rule.custom((value, context) => {
          const linkType = linkButtonOf(context.parent)?.linkType

          if (linkType === 'download') {
            return true
          }

          if (!value) {
            return 'This field is required'
          }

          switch (linkType) {
            case 'external': {
              try {
                const url = new URL(value)

                if (!['https:', 'mailto:', 'tel:'].includes(url.protocol)) {
                  return 'URL must use https, mailto, or tel protocol'
                }

                return true
              } catch {
                return 'Enter a valid URL'
              }
            }

            case 'internal':
              return /^[a-z0-9]+(?:[-/][a-z0-9]+)*$/i.test(value)
                ? true
                : 'Enter a valid internal path, e.g. "about" or "projects"'

            default:
              return true
          }
        }),
    }),
    // A reference cannot carry the language, so the document and its language version sit in one object.
    // Hidden fields are not validated, so the inner `required` rules apply to `download` only.
    defineField({
      name: 'download',
      type: 'object',
      hidden: ({parent}) => !isDownload(parent),
      options: {columns: 1},
      fields: [
        defineField({
          name: 'document',
          type: 'reference',
          to: [{type: 'downloadDocument'}],
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'language',
          type: 'string',
          description: 'Which language version of the document this button downloads.',
          options: {
            list: LANGUAGES.map(({id, title}) => ({title, value: id})),
            layout: 'radio',
            direction: 'horizontal',
          },
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'hasAnchor',
      title: 'Has anchor?',
      type: 'boolean',
      hidden: ({parent}) => isDownload(parent),
    }),
    defineField({
      name: 'anchor',
      title: 'Anchor',
      type: 'string',
      description: 'Enter anchor without # and spaces',
      hidden: ({parent}) => isDownload(parent) || !linkButtonOf(parent)?.hasAnchor,
      validation: (rule) =>
        rule.custom((value, context) => {
          if (isDownload(context.parent) || !linkButtonOf(context.parent)?.hasAnchor) {
            return true
          }

          if (!value) {
            return 'Anchor is required'
          }

          return /^[a-z]+(?:-[a-z]+)*$/i.test(value)
            ? true
            : 'Use letters and hyphens only, e.g. "about" or "my-project"'
        }),
    }),
    defineField({
      name: 'variant',
      type: 'string',
      options: {
        list: [
          {
            title: 'Primary',
            value: 'primary',
          },
          {
            title: 'Secondary',
            value: 'secondary',
          },
          {
            title: 'Accent',
            value: 'accent',
          },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'hasIcon',
      title: 'Show icon',
      type: 'boolean',
    }),
  ],
  preview: {
    select: {
      label: 'label',
      variant: 'variant',
      linkType: 'linkType',
    },
    prepare: ({label, variant, linkType}) => ({
      title: baseText(label) ?? 'Link button',
      subtitle: [variant, linkType].filter(Boolean).join(' · '),
    }),
  },
})
