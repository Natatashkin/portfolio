import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'nwsbdgig',
    dataset: 'production',
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
  // Types for the Next app: schema extracted here, GROQ queries scanned in ../app, output committed there.
  typegen: {
    enabled: true,
    path: '../app/src/**/*.{ts,tsx}',
    schema: './schema.json',
    generates: '../app/src/sanity.types.ts',
    overloadClientMethods: true,
  },
})
