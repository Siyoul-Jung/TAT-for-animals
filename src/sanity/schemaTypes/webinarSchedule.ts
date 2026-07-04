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
      title: 'Date & Time (Pacific Time)',
      type: 'datetime',
      description: 'Enter the webinar time in US Pacific Time — the site shows all times in Pacific.',
      options: {
        // Pin the Studio's input/display to Pacific. Without this the picker
        // interprets whatever the editor types in THEIR local timezone — Jez
        // (UTC+8) entering "9:05 AM" stored an instant that renders as 6:05 PM
        // Pacific on the site (her QA report, 2026-07-04). The switch is locked
        // so the picker can't silently fall back to the editor's zone.
        displayTimeZone: 'America/Los_Angeles',
        allowTimeZoneSwitch: false,
      },
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
