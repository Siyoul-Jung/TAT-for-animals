'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { SearchItem } from '@/lib/search'

// Full-page search — chosen over a cramped navbar dropdown on purpose:
// a full page with one big input is the simplest, most senior-friendly shape,
// and it works the same before and after someone subscribes. The results only
// ever show titles + descriptions; watching happens in the member library.

function formatDate(date: string | null): string {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/** Highlight matched query words so seniors can see WHY a result matched. */
function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  if (tokens.length === 0 || !text) return <>{text}</>
  const pattern = tokens
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .filter(Boolean)
    .join('|')
  if (!pattern) return <>{text}</>
  const parts = text.split(new RegExp(`(${pattern})`, 'gi'))
  const lowered = tokens.map((t) => t.toLowerCase())
  return (
    <>
      {parts.map((part, i) =>
        lowered.includes(part.toLowerCase()) ? (
          <mark key={i} className="rounded bg-green-light px-0.5 text-charcoal">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

type Scored = { item: SearchItem; score: number }

export default function SearchClient({
  items,
  loading = false,
}: {
  items: SearchItem[]
  loading?: boolean
}) {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  // Auth state decides where "watch" sends people — same read as the Navbar.
  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (active) setIsLoggedIn(!!data.user)
    })
    return () => {
      active = false
    }
  }, [])

  // Keep the URL in sync so a search can be shared or reopened — without a
  // navigation (replaceState), so we never refetch the index while typing.
  useEffect(() => {
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    if (query.trim()) params.set('q', query.trim())
    else params.delete('q')
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `/search?${qs}` : '/search')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const tokens = useMemo(
    () => query.toLowerCase().split(/\s+/).map((t) => t.trim()).filter(Boolean),
    [query]
  )

  const results = useMemo<Scored[]>(() => {
    if (tokens.length === 0) return items.map((item) => ({ item, score: 0 }))
    const scored: Scored[] = []
    for (const item of items) {
      const title = item.title.toLowerCase()
      const summary = (item.summary ?? '').toLowerCase()
      const category = (item.category ?? '').toLowerCase()
      let score = 0
      let allMatched = true
      for (const t of tokens) {
        if (title.includes(t)) score += 3
        else if (summary.includes(t)) score += 2
        else if (category.includes(t)) score += 1
        else if (item.haystack.includes(t)) score += 1
        else {
          allMatched = false
          break
        }
      }
      if (allMatched) scored.push({ item, score })
    }
    return scored.sort(
      (a, b) => b.score - a.score || (b.item.date ?? '').localeCompare(a.item.date ?? '')
    )
  }, [items, tokens])

  const hasQuery = tokens.length > 0
  const watchHref = isLoggedIn ? '/library' : '/membership'
  const watchLabel = isLoggedIn ? 'Open in your library' : 'Join to watch'

  return (
    <div className="min-h-screen bg-cream px-4 pb-24 pt-28 sm:pt-32">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="font-serif text-3xl text-charcoal sm:text-4xl">Search</h1>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted">
            Find any video or recording by title or topic — before or after you join.
          </p>
        </header>

        {/* Search box */}
        <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
          <label htmlFor="site-search" className="sr-only">
            Search videos and recordings
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green"
          />
          <input
            id="site-search"
            type="search"
            inputMode="search"
            autoComplete="off"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “anxiety”, “cats”, or “thunderstorm”…"
            className={cn(
              'w-full rounded-full border-2 border-green/25 bg-white py-4 pl-12 pr-12 text-lg text-charcoal',
              'placeholder:text-muted/70 focus:border-green focus:outline-none focus-visible:ring-2 focus-visible:ring-green'
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-charcoal"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </form>

        {/* Result count — announced to screen readers */}
        <p aria-live="polite" className="mt-5 text-sm text-muted">
          {loading
            ? 'Loading…'
            : hasQuery
              ? `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${query.trim()}”`
              : `Browse all ${items.length} videos and recordings`}
        </p>

        {/* Results */}
        {!loading && results.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-green/15 bg-white/60 px-6 py-12 text-center">
            <p className="text-lg text-charcoal">No matches for “{query.trim()}”.</p>
            <p className="mt-2 text-base leading-relaxed text-muted">
              Try a simpler word — an animal, a feeling, or a situation like “fireworks”.
            </p>
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {results.map(({ item }) => (
              <li key={item.id}>
                <Link
                  href={watchHref}
                  className={cn(
                    'group block rounded-2xl border border-green/15 bg-white px-5 py-4 transition-colors',
                    'hover:border-green/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green'
                  )}
                  aria-label={`${item.title} — ${watchLabel}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-serif text-xl leading-snug text-charcoal">
                      <Highlight text={item.title} tokens={tokens} />
                    </h2>
                    <AccessBadge access={item.access} />
                  </div>

                  {item.summary && (
                    <p className="mt-2 line-clamp-3 text-base leading-relaxed text-muted">
                      <Highlight text={item.summary} tokens={tokens} />
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                    {item.category && <span>{item.category}</span>}
                    {item.category && item.date && <span aria-hidden="true">·</span>}
                    {item.date && <span>{formatDate(item.date)}</span>}
                    <span className="ml-auto font-medium text-green group-hover:underline">
                      {watchLabel} →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function AccessBadge({ access }: { access: SearchItem['access'] }) {
  if (access === 'circle') {
    return (
      <span className="shrink-0 whitespace-nowrap rounded-full border border-brand-dark/40 px-3 py-1 text-xs font-semibold text-brand-dark">
        The Calm Circle
      </span>
    )
  }
  return (
    <span className="shrink-0 whitespace-nowrap rounded-full bg-green-light px-3 py-1 text-xs font-semibold text-green">
      The Calm Library
    </span>
  )
}
