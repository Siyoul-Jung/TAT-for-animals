import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { webinarInviteEmail } from '@/lib/emails/webinar-invite'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SANITY_WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { title?: string; date?: string; description?: string; meetingUrl?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { title, date, description, meetingUrl } = body
  if (!title || !date || !meetingUrl) {
    return NextResponse.json({ error: 'Missing required fields: title, date, meetingUrl' }, { status: 400 })
  }

  const { data: subscribers, error } = await supabaseAdmin
    .from('profiles')
    .select('full_name, email')
    .eq('role', 'pro_subscriber')

  if (error) {
    console.error('Supabase query failed:', error)
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No pro_subscriber members found' })
  }

  const results = await Promise.allSettled(
    subscribers.map((sub) => {
      const { subject, html } = webinarInviteEmail(sub.full_name ?? null, {
        title,
        date,
        description: description ?? null,
        meetingUrl,
      })
      return resend.emails.send({ from: FROM_EMAIL, to: sub.email, subject, html })
    })
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  console.log(`Webinar invite: ${sent} sent, ${failed} failed`)
  return NextResponse.json({ sent, failed })
}
