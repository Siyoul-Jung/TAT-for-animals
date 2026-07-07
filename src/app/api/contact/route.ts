import { NextRequest, NextResponse } from 'next/server'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

// Public contact-form endpoint. No auth (anyone can write in), so the spam guards
// are: a honeypot field, input validation + length caps, and a per-IP rate limit
// (shared across instances via Supabase). Messages are emailed to hello@ with the
// sender as reply-to.
const TO_EMAIL = 'hello@tatforanimals.com'

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

  if (!(await checkRateLimit('contact', getClientIp(request), 5, 600))) {
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
