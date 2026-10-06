import {LinkIcon} from '@sanity/icons/Link'
import {defineField, defineType} from 'sanity'
import {LinkButtonInput, type LinkButtonValue} from '../../components/LinkButtonInput'
import {baseText, requiredInBaseLanguage} from '../lib/localized'

// Sanity passes the parent object untyped; read it through one helper.
const linkButtonOf = (parent: unknown) => parent as LinkButtonValue | undefined
const isExternal = (parent: unknown) => Boolean(linkButtonOf(parent)?.isExternal)

export const linkButtonType = defineType({
  name: 'linkButton',
  title: 'Link button',
  type: 'object',
  icon: LinkIcon,
  components: {input: LinkButtonInput},
  // Defaults for every new button, wherever it is created (document, section, array item).
  initialValue: {
    isExternal: false,
    variant: 'primary',
    hasIcon: false,
  },
  fields: [
    defineField({
      name: 'label',
      type: 'internationalizedArrayString',
      validation: requiredInBaseLanguage,
    }),
    defineField({
      name: 'isExternal',
      title: 'External link',
      type: 'boolean',
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      hidden: ({parent}) => !isExternal(parent),
      validation: (rule) =>
        rule
          .uri({scheme: ['https', 'mailto', 'tel']})
          .custom((value, context) =>
            isExternal(context.parent) && !value ? 'Required for an external link' : true,
          ),
    }),
    defineField({
      name: 'page',
      type: 'reference',
      to: [{type: 'page'}],
      hidden: ({parent}) => isExternal(parent),
    }),
    defineField({
      name: 'anchor',
      type: 'string',
      description: 'Section anchor ID without "#", for example: projects',
      hidden: ({parent}) => isExternal(parent),
      validation: (rule) =>
        rule.regex(/^[a-z0-9-]+$/, {name: 'anchor ID'}).custom((value, context) => {
          const parent = linkButtonOf(context.parent)
          return !parent?.isExternal && !value && !parent?.page
            ? 'Choose a page, an anchor, or both'
            : true
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
      isExternal: 'isExternal',
    },
    prepare: ({label, variant, isExternal: external}) => ({
      title: baseText(label) ?? 'Link button',
      subtitle: [variant, external ? 'external' : 'internal'].filter(Boolean).join(' · '),
    }),
  },
})
