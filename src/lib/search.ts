import { sanityClient } from '@/lib/sanity'

// Site-wide search index — deliberately PUBLIC-SAFE.
//
// Tapas asked that visitors be able to search the whole site "including the
// recording titles and descriptions both prior to and after subscription
// purchase." So the index carries titles + descriptions only.
//
// The access boundary is the query itself, not the UI (same rule as the locked
// RecordingPreview in library/page.tsx): we never select `videoUrl` here, so a
// guest — or the browser — can never pull a playable link out of search. The
// video only becomes reachable inside the member-gated /library.
//
// Only "TAT for Animals" videos surface (Healing ACEs Plus lives on tatlife.com,
// same rule as the library query). Webinar recordings are The Calm Circle tier.

export type SearchKind = 'video' | 'recording'
export type SearchAccess = 'library' | 'circle'

export type SearchItem = {
  id: string
  kind: SearchKind
  access: SearchAccess
  title: string
  summary: string | null
  category: string | null
  /** Extra match text (keywords + topic tags), never shown — search only. */
  haystack: string
  date: string | null
}

type RawVideo = {
  _id: string
  title: string
  summary: string | null
  category: string | null
  keywords: string | null
  topicTags: string[] | null
  dateRecorded: string | null
}

type RawRecording = {
  _id: string
  title: string
  summary: string | null
  date: string | null
}

/**
 * Fetch the public search index. Throws on Sanity failure — callers should
 * wrap in try/catch and degrade to an empty index (mirrors library/page.tsx).
 */
export async function fetchSearchIndex(): Promise<SearchItem[]> {
  const [videos, recordings] = await Promise.all([
    sanityClient.fetch<RawVideo[]>(
      `*[_type == "video" && status == "published" && library == "TAT for Animals"] | order(dateRecorded desc) {
        _id, title, summary, category, keywords, topicTags, dateRecorded
      }`
    ),
    sanityClient.fetch<RawRecording[]>(
      `*[_type == "webinarRecording" && status == "published"] | order(date desc) {
        _id, title, summary, date
      }`
    ),
  ])

  const videoItems: SearchItem[] = videos.map((v) => ({
    id: v._id,
    kind: 'video',
    access: 'library',
    title: v.title,
    summary: v.summary ?? null,
    category: v.category ?? null,
    haystack: [v.keywords ?? '', (v.topicTags ?? []).join(' ')].join(' ').toLowerCase(),
    date: v.dateRecorded ?? null,
  }))

  const recordingItems: SearchItem[] = recordings.map((r) => ({
    id: r._id,
    kind: 'recording',
    access: 'circle',
    title: r.title,
    summary: r.summary ?? null,
    category: null,
    haystack: '',
    date: r.date ?? null,
  }))

  // Newest first across both types (null dates sink to the bottom).
  return [...videoItems, ...recordingItems].sort((a, b) =>
    (b.date ?? '').localeCompare(a.date ?? '')
  )
}
