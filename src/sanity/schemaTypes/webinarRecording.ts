import { defineField, defineType } from 'sanity'

export const webinarRecordingType = defineType({
  name: 'webinarRecording',
  title: 'Webinar Recording',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'date',
      title: 'Recording Date',
      type: 'date',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'Vimeo link',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: '2–3 sentence description',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Ready', value: 'ready' },
          { title: 'Published', value: 'published' },
        ],
      },
      initialValue: 'draft',
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'date',
    },
  },
})
