import { supabaseAdmin } from '@/lib/supabase/admin'
import { reportOpsError } from '@/lib/alertOps'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/?error=invalid-link`)
  }

  const { data: deletionRequest } = await supabaseAdmin
    .from('account_deletion_requests')
    .select('user_id, expires_at, status')
    .eq('token', token)
    .single()

  if (!deletionRequest) {
    return NextResponse.redirect(`${siteUrl}/?error=invalid-link`)
  }

  if (deletionRequest.status !== 'pending') {
    return NextResponse.redirect(`${siteUrl}/?error=already-processed`)
  }

  if (new Date(deletionRequest.expires_at) < new Date()) {
    return NextResponse.redirect(`${siteUrl}/?error=link-expired`)
  }

  // Re-check subscription at confirmation time. A subscription can be created
  // during the 24h window between request and confirmation; deleting the account
  // anyway would leave an orphaned subscription billing the customer forever.
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_subscription_id, paypal_subscription_id')
    .eq('id', deletionRequest.user_id)
    .single()

  if (profile?.stripe_subscription_id || profile?.paypal_subscription_id) {
    // Redirect to the homepage notice (not /dashboard): the email link may be
    // opened in a logged-out browser, where /dashboard bounces to a bare login
    // form and the reason for the blocked deletion is lost.
    return NextResponse.redirect(`${siteUrl}/?error=cancel-subscription-first`)
  }

  // Mark as completed before deletion to prevent race conditions (double-click
  // on the email link). If the delete fails, revert to pending so it can retry.
  await supabaseAdmin
    .from('account_deletion_requests')
    .update({ status: 'completed' })
    .eq('token', token)

  // Delete user — cascades to profiles via ON DELETE CASCADE
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
    deletionRequest.user_id
  )

  if (deleteError) {
    // Alert the team — a user asked to be deleted and it didn't happen; that's a
    // compliance-sensitive failure that must not go unnoticed. (Also logs.)
    await reportOpsError('account-deletion', deleteError, { userId: deletionRequest.user_id })
    await supabaseAdmin
      .from('account_deletion_requests')
      .update({ status: 'pending' })
      .eq('token', token)
    return NextResponse.redirect(`${siteUrl}/?error=deletion-failed`)
  }

  return NextResponse.redirect(`${siteUrl}/?deleted=true`)
}
