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
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'date',
    },
  },
})
