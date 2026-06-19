import { defineField, defineType } from 'sanity'

export const videoType = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'library',
      title: 'Library',
      type: 'string',
      initialValue: 'TAT for Animals',
      options: {
        list: [
          { title: 'TAT for Animals', value: 'TAT for Animals' },
          { title: 'Healing ACEs Plus', value: 'Healing ACEs Plus' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      // Required so a manual Studio add can't be saved without picking a shelf —
      // an empty category drops the video into an ungrouped pile in the library.
      // (Studio-only guard; bulk API writes bypass validation, so the import
      // mapping must still include this field.)
      options: {
        list: [
          { title: 'Foundational', value: 'Foundational' },
          { title: 'Main Content', value: 'Main Content' },
          { title: 'Bonus 2025', value: 'Bonus 2025' },
          { title: 'Bonus 2026', value: 'Bonus 2026' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Vimeo URL',
      type: 'url',
      description: 'Paste the Vimeo video link here',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      type: 'number',
      description: 'Total length in seconds (e.g. 90 = 1:30)',
    }),
    defineField({
      name: 'dateRecorded',
      title: 'Date Recorded',
      type: 'date',
      description: 'Recording date',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: '2–3 sentences describing the video',
    }),
    defineField({
      name: 'topicTags',
      title: 'Topic Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: '5–8 topic tags for filtering (e.g. "anxiety, trauma, cats")',
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'text',
      rows: 2,
      description: '8–12 search keywords, comma-separated',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'published',
      options: {
        list: [
          { title: 'Published', value: 'published' },
          { title: 'Draft (hidden from members)', value: 'draft' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      library: 'library',
      status: 'status',
    },
    prepare({ title, library, status }) {
      const lib = library === 'Healing ACEs Plus' ? 'ACEs' : 'Animals'
      const isDraft = status === 'draft' ? ' · Draft' : ''
      return {
        title,
        subtitle: `${lib}${isDraft}`,
      }
    },
  },
})
