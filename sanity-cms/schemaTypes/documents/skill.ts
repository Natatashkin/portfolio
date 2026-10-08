import {BulbOutlineIcon} from '@sanity/icons/BulbOutline'
import {defineField, defineType} from 'sanity'
import {baseText, requiredInAllLanguages} from '../lib/localized'

export const skillType = defineType({
  name: 'skill',
  title: 'Skill',
  type: 'document',
  icon: BulbOutlineIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'internationalizedArrayString',
      validation: requiredInAllLanguages,
    }),
    defineField({
      name: 'description',
      type: 'internationalizedArrayText',
    }),
    defineField({
      name: 'iconKey',
      type: 'string',
      description: 'Optional. Icon name from the site code; unknown keys show no icon.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      iconKey: 'iconKey',
    },
    prepare: ({title, iconKey}) => ({
      title: baseText(title) ?? 'Skill',
      subtitle: iconKey,
    }),
  },
})
