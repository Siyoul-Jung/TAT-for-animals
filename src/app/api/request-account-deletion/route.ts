import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { accountDeletionEmail } from '@/lib/emails/account-deletion'
import { NextResponse } from 'next/server'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Block deletion while a subscription is still active — must cancel first
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_subscription_id, paypal_subscription_id')
    .eq('id', user.id)
    .single()

  if (profile?.stripe_subscription_id || profile?.paypal_subscription_id) {
    return NextResponse.json(
      { error: 'Please cancel your subscription before deleting your account.' },
      { status: 400 }
    )
  }

  // Check for existing pending request
  const { data: existing } = await supabaseAdmin
    .from('account_deletion_requests')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single()

  if (existing) {
    return NextResponse.json({ error: 'A deletion request is already pending. Check your email.' }, { status: 400 })
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  await supabaseAdmin
    .from('account_deletion_requests')
    .insert({
      user_id: user.id,
      requested_at: new Date().toISOString(),
      status: 'pending',
      token,
      expires_at: expiresAt,
    })

  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/confirm-account-deletion?token=${token}`
  const { subject, html } = accountDeletionEmail(confirmUrl)

  await resend.emails.send({
    from: FROM_EMAIL,
    to: user.email!,
    subject,
    html,
  })

  return NextResponse.json({ success: true })
}
