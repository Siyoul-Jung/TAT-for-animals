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
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Foundational', value: 'foundational' },
          { title: 'Main Content', value: 'main' },
          { title: 'Bonus 2025', value: 'bonus-2025' },
          { title: 'Bonus 2026', value: 'bonus-2026' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'library',
      title: 'Library',
      type: 'string',
      initialValue: 'TAT for Animals',
      readOnly: true,
    }),
    defineField({
      name: 'audience',
      title: 'Audience',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Public', value: 'public' },
          { title: 'Students', value: 'students' },
          { title: 'Pros', value: 'pros' },
          { title: 'Subscribers', value: 'subscribers' },
        ],
      },
      initialValue: ['subscribers'],
    }),
    defineField({
      name: 'level',
      title: 'Level',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
        ],
      },
    }),
    defineField({
      name: 'duration',
      title: 'Duration (minutes)',
      type: 'number',
    }),
    defineField({
      name: 'dateRecorded',
      title: 'Date Recorded',
      type: 'date',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: '2–3 sentence plain-language description',
    }),
    defineField({
      name: 'topicTags',
      title: 'Topic Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: '5–8 topic tags for filtering',
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'text',
      rows: 2,
      description: '8–12 search keywords, comma-separated',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'Vimeo link',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      initialValue: 'Vimeo',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: subtitle ?? '',
      }
    },
  },
})
