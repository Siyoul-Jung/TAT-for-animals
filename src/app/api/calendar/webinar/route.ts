import { NextRequest } from 'next/server'
import { buildIcs } from '@/lib/ics'

// Stateless "Add to calendar" endpoint. The invite email links here with the
// event details in the query string; we hand back a downloadable .ics that the
// member's calendar app opens and shows in their own local time.
//
// Example: /api/calendar/webinar?start=2026-06-19T18:00:00.000Z&title=...&url=...
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams

  const start = p.get('start')
  if (!start || Number.isNaN(Date.parse(start))) {
    return new Response('Invalid or missing "start" (ISO datetime required)', { status: 400 })
  }

  const startDate = new Date(start)
  // No duration field in Sanity yet — default to a 60-minute session.
  const durationMin = Number(p.get('min')) || 60
  const endDate = new Date(startDate.getTime() + durationMin * 60_000)

  const title = p.get('title') ?? 'TAT for Animals — Live Webinar'
  const meetingUrl = p.get('url') ?? undefined
  const description = p.get('desc') ?? undefined

  const ics = buildIcs({
    // Deterministic UID so re-downloads update the same calendar entry.
    uid: `${startDate.toISOString()}-tatforanimals`,
    title,
    start: startDate,
    end: endDate,
    description,
    url: meetingUrl,
    location: meetingUrl, // the Zoom link doubles as the event location
  })

  return new Response(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="tat-live-webinar.ics"',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
