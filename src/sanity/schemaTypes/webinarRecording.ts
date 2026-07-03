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
      // Without this, a Studio-created recording has no `status` at all, and
      // the library query (`status == "published"`) silently excludes it —
      // it never appears in "Most Recent Recordings" (Jez's QA report,
      // 2026-07-02). Existing recordings were seeded with status via script,
      // which is why only new Studio entries were affected.
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
      date: 'date',
      status: 'status',
    },
    prepare({ title, date, status }) {
      // Surface drafts in the Studio list (mirrors video.ts) — the status
      // field exists so Jez can hide a recording, which only helps if she
      // can see at a glance which ones are hidden.
      const isDraft = status === 'draft' ? ' · Draft' : ''
      return { title, subtitle: `${date ?? ''}${isDraft}` }
    },
  },
})
