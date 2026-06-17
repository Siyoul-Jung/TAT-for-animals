import { resend, FROM_EMAIL } from '@/lib/resend'
import { NextRequest, NextResponse } from 'next/server'

// Receives content-review answers from the hosted review doc and emails them to
// the team. The doc is a static page (no per-user storage), so this is how a
// reviewer's marks actually reach us — one click, no download/reply needed.
//
// The doc lives at an unguessable URL and sends a fixed token; this is a light
// speed-bump against stray bots, not real auth (the token is visible in the page
// source). Acceptable for a temporary, unlisted review tool.
const REVIEW_TOKEN = 'tat-content-review-2026'
const TO_EMAIL = 'philoleben@gmail.com'

export async function POST(request: NextRequest) {
  let payload: { reviewer?: string; date?: string; body?: string; token?: string; subjectTag?: string }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  if (payload.token !== REVIEW_TOKEN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const reviewer = (payload.reviewer || '').toString().slice(0, 100) || 'a reviewer'
  const date = (payload.date || '').toString().slice(0, 100)
  const body = (payload.body || '').toString().slice(0, 50000)
  // Lets each review round label its emails (e.g. "Content review" vs
  // "Function & design") so a multi-round review doesn't land under one subject.
  const tag = (payload.subjectTag || 'Content review').toString().slice(0, 60)

  if (!body.trim()) {
    return NextResponse.json({ error: 'Nothing to send' }, { status: 400 })
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: TO_EMAIL,
      subject: `${tag} — ${reviewer}${date ? ` (${date})` : ''}`,
      text: `${tag} feedback\nReviewer: ${reviewer}\nDate: ${date || '—'}\n\n${body}`,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Send failed' }, { status: 500 })
  }
}
