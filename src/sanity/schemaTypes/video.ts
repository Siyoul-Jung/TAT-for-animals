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
      options: {
        list: [
          { title: 'Foundational', value: 'Foundational' },
          { title: 'Main Content', value: 'Main Content' },
          { title: 'Bonus 2025', value: 'Bonus 2025' },
          { title: 'Bonus 2026', value: 'Bonus 2026' },
        ],
        layout: 'radio',
      },
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
      title: 'Duration (minutes)',
      type: 'number',
      description: 'Approximate length in minutes',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: '2–3 sentences describing the video',
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
