import { createElement } from 'react'
import { defineField, defineType } from 'sanity'
import { VimeoThumbnail } from '../components/VimeoThumbnail'

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
        // Category values defined by Jez (2026-06-26). Must stay identical to
        // the values inside CATEGORY_GROUPS in LibraryClient.tsx — a mismatch
        // drops videos into the ungrouped pile. The site groups/renames these
        // into shelves ("Start Here", "Core Basics", "Stories To Enjoy",
        // "Calm Circle Webinars 2025/2026" — Tapas/Jez, 2026-08-27) for display
        // only; pick the value that matches what the video actually is, the
        // display label is handled for you. "Stories To Enjoy" (Jez,
        // 2026-08-27) is for testimonial videos — animals' TAT experiences with
        // their humans — kept apart from the teaching "Core Basics".
        // "Calm Tips" (Tapas, 2026-09-06) is for the short tip videos; it
        // sits last, just before the catch-all "All" chip.
        list: [
          { title: 'Foundational Content', value: 'Foundational Content' },
          { title: 'Main Content', value: 'Main Content' },
          { title: 'Stories To Enjoy', value: 'Stories To Enjoy' },
          { title: 'Bonus Content 2025', value: 'Bonus Content 2025' },
          { title: 'Bonus Content 2026', value: 'Bonus Content 2026' },
          { title: 'Legacy Content', value: 'Legacy Content' },
          { title: 'Calm Tips', value: 'Calm Tips' },
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
      videoUrl: 'videoUrl',
    },
    prepare({ title, library, status, videoUrl }) {
      const lib = library === 'Healing ACEs Plus' ? 'ACEs' : 'Animals'
      const isDraft = status === 'draft' ? ' · Draft' : ''
      return {
        title,
        subtitle: `${lib}${isDraft}`,
        // A real thumbnail so Jez can recognize the video without opening
        // each Vimeo link in a new tab to check it (her request, 2026-07-02).
        media: createElement(VimeoThumbnail, { videoUrl }),
      }
    },
  },
})
