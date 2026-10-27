import {CogIcon} from '@sanity/icons/Cog'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import type {StructureResolver} from 'sanity/structure'

// Documents with a drag-and-drop order. Each one needs orderRankField and orderRankOrdering in its schema.
const CONTENT_TYPES = [
  'project',
  'experience',
  'skill',
  'piece',
  'road',
  'metric',
  'technology',
  'downloadDocument',
] as const

export const structure: StructureResolver = (S, context) =>
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
      ...CONTENT_TYPES.map((type) => {
        // The plugin names the entry "Orderable <type>" with a sort icon; keep the schema's own title and icon.
        const {title, icon} = context.schema.get(type) ?? {}
        return orderableDocumentListDeskItem({type, title, icon, S, context})
      }),
    ])
