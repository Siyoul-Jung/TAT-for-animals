import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { checkRateLimit, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'
import { membershipHasLapsed } from '@/lib/access'
import { escapeHtml } from '@/lib/emails/layout'

// "Share your story" (Tapas, 2026-08-14): both tiers can submit their TAT
// experience with an optional photo. Stories go to hello@ (same inbox as the
// contact form) rather than the tatforanimals.com Tapas alias — this is
// marketing/testimonial material for Tapas and Jez to review, not a question
// headed straight to Tapas the way webinar questions are.
const TO_EMAIL = 'hello@tatforanimals.com'

const MAX_STORY_LENGTH = 5000
// Vercel's default Node serverless function request body limit is 4.5MB —
// a cap above that would fail at the platform level before this code ever
// runs, surfacing as a generic connection error instead of the friendly
// "too large" message below. Stay comfortably under it.
const MAX_PHOTO_BYTES = 4 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic'])

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Please sign in to share your story.' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email, cancel_at')
    .eq('id', user.id)
    .single()
  // Matches the page's own gating (a lapsed PayPal cancellation has no
  // period-end webhook to flip role, so it's enforced lazily here too —
  // see lib/access.ts).
  const role = membershipHasLapsed(profile?.cancel_at) ? 'guest' : profile?.role
  if (!profile || (role !== 'subscriber' && role !== 'pro_subscriber')) {
    return NextResponse.json(
      { error: 'Sharing your story is part of your TAT for Animals membership.' },
      { status: 403 },
    )
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 400 })
  }

  const story = String(form.get('story') ?? '').trim()
  const consent = form.get('consent') === 'true'
  const photo = form.get('photo')

  if (!story) {
    return NextResponse.json({ error: 'Please write your story first.' }, { status: 400 })
  }
  if (story.length > MAX_STORY_LENGTH) {
    return NextResponse.json(
      { error: 'That story is a little too long — please shorten it and try again.' },
      { status: 400 },
    )
  }
  if (!consent) {
    return NextResponse.json(
      { error: 'Please check the box to confirm you’re okay sharing your story.' },
      { status: 400 },
    )
  }

  let photoAttachment: { filename: string; content: Buffer; content_type: string } | null = null
  if (photo instanceof File && photo.size > 0) {
    if (!ALLOWED_PHOTO_TYPES.has(photo.type)) {
      return NextResponse.json(
        { error: 'That photo type isn’t supported — please use a JPEG, PNG, WEBP, or HEIC image.' },
        { status: 400 },
      )
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { error: 'That photo is too large — please use one under 4MB.' },
        { status: 400 },
      )
    }
    photoAttachment = {
      filename: photo.name || 'story-photo.jpg',
      content: Buffer.from(await photo.arrayBuffer()),
      content_type: photo.type,
    }
  }

  // Keyed to the member (not IP) — a story is a rare, deliberate submission,
  // so this only guards against a stuck retry loop, not real usage.
  if (!(await checkRateLimit('share-story', user.id, 3, 3600))) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
  }

  const memberName = profile.full_name || 'A TAT for Animals member'
  const memberEmail = profile.email || user.email || ''

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1C1007;">
      <p style="margin:0 0 12px;"><strong>New shared story from TAT for Animals</strong></p>
      <p style="margin:0 0 4px;"><strong>From:</strong> ${escapeHtml(memberName)}</p>
      <p style="margin:0 0 12px;"><strong>Email:</strong> ${escapeHtml(memberEmail)}</p>
      <p style="margin:0 0 12px;"><strong>Sharing consent:</strong> Checked (TATLife Participant Release &amp; License Agreement)</p>
      <p style="margin:0;padding-top:12px;border-top:1px solid #eee;white-space:pre-wrap;">${escapeHtml(story)}</p>
    </div>`

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: memberEmail || undefined,
      subject: `New shared story from ${memberName}`,
      html,
      attachments: photoAttachment ? [photoAttachment] : undefined,
    })
    if (error) {
      console.error('Share story send failed:', error)
      return NextResponse.json(
        { error: "We couldn't send your story just now. Please try again in a moment." },
        { status: 502 },
      )
    }
  } catch (e) {
    console.error('Share story error:', e)
    return NextResponse.json(
      { error: "We couldn't send your story just now. Please try again in a moment." },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
