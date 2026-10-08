import {LinkIcon} from '@sanity/icons/Link'
import {ConditionalDescription} from '../../components/ConditionalDescription'
import {createElement} from 'react'
import {defineField, defineType} from 'sanity'
import {baseText, requiredInAllLanguages} from '../lib/localized'

const LINK_TYPES = [
  {title: 'Internal', value: 'internal'},
  {title: 'External', value: 'external'},
] as const

type LinkButtonValue = {
  linkType?: (typeof LINK_TYPES)[number]['value']
  hasAnchor?: boolean
}

// Sanity passes the parent object untyped; read it through one helper.
const linkButtonOf = (parent: unknown) => parent as LinkButtonValue | undefined

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
      type: 'url',
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
      validation: (rule) =>
        rule.custom((value, context) => {
          const linkType = linkButtonOf(context.parent)?.linkType

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
    defineField({
      name: 'hasAnchor',
      title: 'Has anchor?',
      type: 'boolean',
    }),
    defineField({
      name: 'anchor',
      title: 'Anchor',
      type: 'string',
      description: 'Enter anchor without # and spaces',
      hidden: ({parent}) => !linkButtonOf(parent)?.hasAnchor,
      validation: (rule) =>
        rule.custom((value, context) => {
          if (!linkButtonOf(context.parent)?.hasAnchor) {
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
