import {CogIcon} from '@sanity/icons/Cog'
import type {StructureResolver} from 'sanity/structure'

const CONTENT_TYPES = [
  'project',
  'experience',
  'skill',
  'piece',
  'road',
  'metric',
  'technology',
] as const

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site settings')
        .id('siteSettings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.documentTypeListItem('page').title('Pages'),
      S.divider(),
      ...CONTENT_TYPES.map((type) => S.documentTypeListItem(type)),
    ])
