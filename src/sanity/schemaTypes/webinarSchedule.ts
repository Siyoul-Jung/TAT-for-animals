import { defineField, defineType } from 'sanity'

export const webinarScheduleType = defineType({
  name: 'webinarSchedule',
  title: 'Webinar Schedule',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Session Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date & Time',
      type: 'datetime',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Brief description shown to members',
    }),
    defineField({
      name: 'meetingUrl',
      title: 'Zoom Meeting URL',
      type: 'url',
      description: 'Paste the Zoom join link here',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'date',
    },
  },
})
