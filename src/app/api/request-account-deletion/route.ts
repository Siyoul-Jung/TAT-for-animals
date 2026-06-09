import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { accountDeletionEmail } from '@/lib/emails/account-deletion'
import { membershipHasLapsed } from '@/lib/access'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Block deletion while a subscription is still active — must cancel first.
  // A cancelled membership that has passed its paid-through date counts as
  // already gone (PayPal leaves the id set with no period-end event; mirror the
  // dashboard's lapsed view so the UI and server agree).
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_subscription_id, paypal_subscription_id, cancel_at')
    .eq('id', user.id)
    .single()

  const hasLiveSubscription =
    !membershipHasLapsed(profile?.cancel_at) &&
    (profile?.stripe_subscription_id || profile?.paypal_subscription_id)

  if (hasLiveSubscription) {
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

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('account_deletion_requests')
    .insert({
      user_id: user.id,
      requested_at: new Date().toISOString(),
      status: 'pending',
      token,
      expires_at: expiresAt,
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    console.error('Account deletion request insert failed:', insertError)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }

  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/confirm-account-deletion?token=${token}`
  const { subject, html } = accountDeletionEmail(confirmUrl)

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email!,
      subject,
      html,
    })
  } catch (emailError) {
    // The confirmation email is the only way to complete deletion, so a failed
    // send must roll back the pending row — otherwise the "already pending"
    // guard above would lock the user out for 24 hours with no way to confirm.
    console.error('Account deletion email failed:', emailError)
    await supabaseAdmin
      .from('account_deletion_requests')
      .delete()
      .eq('id', inserted.id)
    return NextResponse.json(
      { error: "We couldn't send the confirmation email. Please try again." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
