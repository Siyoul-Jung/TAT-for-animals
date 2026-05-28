import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './src/sanity/schemaTypes'

export default defineConfig({
  name: 'tat-for-animals',
  title: 'TAT for Animals',
  basePath: '/studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('TAT for Animals')
              .child(
                S.documentList()
                  .title('TAT for Animals Videos')
                  .filter('_type == "video" && library == "TAT for Animals"')
                  .defaultOrdering([{ field: 'category', direction: 'asc' }])
              ),
            S.listItem()
              .title('Healing ACEs Plus')
              .child(
                S.documentList()
                  .title('Healing ACEs Plus Videos')
                  .filter('_type == "video" && library == "Healing ACEs Plus"')
                  .defaultOrdering([{ field: 'category', direction: 'asc' }])
              ),
            S.divider(),
            S.listItem()
              .title('Live Session Recordings')
              .child(
                S.documentList()
                  .title('Recordings')
                  .filter('_type == "webinarRecording"')
                  .defaultOrdering([{ field: 'date', direction: 'desc' }])
              ),
            S.listItem()
              .title('Upcoming Sessions')
              .child(
                S.documentList()
                  .title('Upcoming Sessions')
                  .filter('_type == "webinarSchedule"')
                  .defaultOrdering([{ field: 'date', direction: 'asc' }])
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
