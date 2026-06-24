import { NextRequest, NextResponse } from 'next/server'
import { resend, FROM_EMAIL } from '@/lib/resend'

// Public contact-form endpoint. No auth (anyone can write in), so the spam guards
// are: a honeypot field, input validation + length caps, and a best-effort
// per-IP rate limit. Messages are emailed to hello@ with the sender as reply-to.
const TO_EMAIL = 'hello@tatforanimals.com'

// Best-effort throttle. Serverless instances don't share memory, so this only
// slows a bot that keeps hitting the same warm instance — the honeypot is the
// real guard. Kept intentionally simple (no external store) for now.
const hits = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5

function rateLimited(ip: string): boolean {
  const now = Date.now()
  // Drop IPs whose window has fully expired so the map can't grow unbounded on a
  // long-lived warm instance. Only sweep once it's grown, to avoid the cost on
  // every request.
  if (hits.size > 500) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k)
    }
  }
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > MAX_PER_WINDOW
}

const ESCAPE: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESCAPE[c])
}

export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; message?: string; website?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 400 })
  }

  // Honeypot: real people leave this hidden field empty; bots tend to fill it.
  // Pretend success so the bot doesn't learn it was caught.
  if (body.website) return NextResponse.json({ ok: true })

  const name = body.name?.trim() ?? ''
  const email = body.email?.trim() ?? ''
  const message = body.message?.trim() ?? ''

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Please fill in your name, email, and message.' },
      { status: 400 },
    )
  }
  if (name.length > 200 || email.length > 200 || message.length > 5000) {
    return NextResponse.json(
      { error: 'That message is a little too long — please shorten it and try again.' },
      { status: 400 },
    )
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "That email address doesn't look quite right — please check it." },
      { status: 400 },
    )
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "You've sent a few messages already — please try again in a little while." },
      { status: 429 },
    )
  }

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1C1007;">
      <p style="margin:0 0 12px;"><strong>New message from the TAT for Animals contact form</strong></p>
      <p style="margin:0 0 4px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 12px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin:0;padding-top:12px;border-top:1px solid #eee;white-space:pre-wrap;">${escapeHtml(message)}</p>
    </div>`

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `New contact message from ${name}`,
      html,
    })
    if (error) {
      console.error('Contact form send failed:', error)
      return NextResponse.json(
        { error: "We couldn't send your message just now. Please try again, or email hello@tatforanimals.com directly." },
        { status: 502 },
      )
    }
  } catch (e) {
    console.error('Contact form error:', e)
    return NextResponse.json(
      { error: "We couldn't send your message just now. Please try again, or email hello@tatforanimals.com directly." },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
