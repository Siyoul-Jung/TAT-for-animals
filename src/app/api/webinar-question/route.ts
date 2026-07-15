import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { checkRateLimit, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'

// "Ask Tapas your question for an upcoming live webinar" (Tapas, 2026-07-14).
// Circle-only: the question form lives on the library's Live Webinars tab, and
// this route re-checks the role server-side — a client-side gate alone isn't
// access control. The member is signed in, so name/email come from the account
// (one textarea to fill, nothing to retype).
const TO_EMAIL = 'tapas@tatlife.com'

const ESCAPE: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESCAPE[c])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Please sign in to send a question.' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'pro_subscriber') {
    return NextResponse.json(
      { error: 'Sending questions for live webinars is part of The Calm Circle.' },
      { status: 403 },
    )
  }

  let body: { question?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 400 })
  }

  const question = body.question?.trim() ?? ''
  if (!question) {
    return NextResponse.json({ error: 'Please write your question first.' }, { status: 400 })
  }
  if (question.length > 3000) {
    return NextResponse.json(
      { error: 'That question is a little too long — please shorten it and try again.' },
      { status: 400 },
    )
  }

  // Keyed to the member (not IP) — generous enough for a re-send after a typo,
  // tight enough that a stuck retry loop can't flood Tapas's inbox.
  if (!(await checkRateLimit('webinar-question', user.id, 5, 3600))) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
  }

  const memberName = profile.full_name || 'A Calm Circle member'
  const memberEmail = profile.email || user.email || ''

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1C1007;">
      <p style="margin:0 0 12px;"><strong>New question for an upcoming live webinar</strong></p>
      <p style="margin:0 0 4px;"><strong>From:</strong> ${escapeHtml(memberName)}</p>
      <p style="margin:0 0 12px;"><strong>Email:</strong> ${escapeHtml(memberEmail)}</p>
      <p style="margin:0;padding-top:12px;border-top:1px solid #eee;white-space:pre-wrap;">${escapeHtml(question)}</p>
    </div>`

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: memberEmail || undefined,
      subject: `Webinar question from ${memberName}`,
      html,
    })
    if (error) {
      console.error('Webinar question send failed:', error)
      return NextResponse.json(
        { error: "We couldn't send your question just now. Please try again in a moment." },
        { status: 502 },
      )
    }
  } catch (e) {
    console.error('Webinar question error:', e)
    return NextResponse.json(
      { error: "We couldn't send your question just now. Please try again in a moment." },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
