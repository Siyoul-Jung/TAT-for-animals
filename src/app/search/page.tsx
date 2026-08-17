import type { Metadata } from 'next'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { fetchSearchIndex, type SearchItem } from '@/lib/search'
import SearchClient from './SearchClient'

export const metadata: Metadata = {
  title: 'Search | TAT for Animals',
  description: 'Search every TAT for Animals video and recording by title or topic.',
}

// The Sanity fetch is dynamic data, so it streams inside Suspense
// (this project runs with cacheComponents). The static shell paints first;
// the searchable list arrives a moment later.
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchClient items={[]} loading />}>
      <SearchIndex />
    </Suspense>
  )
}

async function SearchIndex() {
  // Opt this subtree into request-time rendering (cacheComponents): without it,
  // the index would be fetched once at build (no env → empty) and frozen static,
  // leaving production search permanently blank. The static shell above still
  // prerenders; only the results stream at request time.
  await connection()

  let items: SearchItem[] = []
  try {
    items = await fetchSearchIndex()
  } catch (e) {
    // Degrade gracefully — show the search UI with an empty index rather than
    // crashing to the error boundary if Sanity is slow or down.
    console.error('Search: index fetch failed, showing empty search:', e)
  }
  return <SearchClient items={items} />
}
