import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { accountDeletionEmail } from '@/lib/emails/account-deletion'
import { membershipHasLapsed } from '@/lib/access'
import { checkRateLimit, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Bound how often one account can trigger a deletion email (Resend cost + spam).
  if (!(await checkRateLimit('account-deletion', user.id, 5, 3600))) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
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

  // If a pending request already exists, replace it rather than erroring. This
  // makes a repeat click idempotent AND useful: "Send again" (when the first
  // email didn't arrive) issues a fresh token and a fresh email, and an old
  // expired request can never lock the user out.
  if (existing) {
    await supabaseAdmin
      .from('account_deletion_requests')
      .delete()
      .eq('id', existing.id)
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

  // Link to a confirmation PAGE, not the delete endpoint directly. Email link
  // scanners / antivirus / SafeLinks issue GET prefetches on links, which would
  // auto-confirm an irreversible deletion. The page only renders; the actual
  // delete happens on an explicit button POST from the user.
  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/confirm-account-deletion?token=${token}`
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
