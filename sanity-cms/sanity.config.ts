import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {internationalizedArray} from 'sanity-plugin-internationalized-array'
import {schemaTypes, singletonTypes} from './schemaTypes'
import {BASE_LANGUAGE, LANGUAGES} from './schemaTypes/lib/languages'
import {structure} from './structure'

// Singletons can only be published, discarded or restored: no delete, duplicate or unpublish.
const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'default',
  title: 'Portfolio',

  projectId: 'nwsbdgig',
  dataset: 'production',

  plugins: [
    structureTool({structure}),
    visionTool(),
    internationalizedArray({
      languages: LANGUAGES,
      defaultLanguages: [BASE_LANGUAGE],
      fieldTypes: ['string', 'text', 'richText', 'headline'],
      // Uses @sanity/language-filter under the hood: it is a required peer dependency of this
      // plugin, so keep it in package.json even though nothing imports it directly.
      languageFilter: {
        documentTypes: schemaTypes
          .filter((type) => type.type === 'document')
          .map((type) => type.name),
      },
    }),
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
  },

  document: {
    actions: (actions, {schemaType}) =>
      singletonTypes.has(schemaType)
        ? actions.filter(({action}) => action !== undefined && SINGLETON_ACTIONS.has(action))
        : actions,
  },
})
