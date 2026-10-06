import type {FieldGroupDefinition, PreviewConfig} from 'sanity'
import {baseText} from './localized'

// Every section uses the same four tabs; Studio hides a tab that has no fields.
export const sectionGroups: FieldGroupDefinition[] = [
  {
    name: 'content',
    title: 'Content',
    default: true,
  },
  {
    name: 'media',
    title: 'Media',
  },
  {
    name: 'actions',
    title: 'Actions',
  },
  {
    name: 'settings',
    title: 'Settings',
  },
]

/** Section label as the title, the English headline as the subtitle. */
export function sectionPreview(label: string): PreviewConfig {
  return {
    select: {headline: 'headline'},
    prepare: ({headline}) => ({
      title: label,
      subtitle: baseText(headline),
    }),
  }
}
