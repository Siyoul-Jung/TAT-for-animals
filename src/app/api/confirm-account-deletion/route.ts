import { supabaseAdmin } from '@/lib/supabase/admin'
import { reportOpsError } from '@/lib/alertOps'
import { NextRequest, NextResponse } from 'next/server'

// POST (not GET): the actual, irreversible deletion must be an explicit user
// action, never something an email link scanner / antivirus prefetch can trigger
// with a background GET. The emailed link opens /confirm-account-deletion (a
// page); its button POSTs here with the token.
export async function POST(request: NextRequest) {
  let token: string | undefined
  try {
    token = (await request.json())?.token
  } catch {
    token = undefined
  }

  if (!token) {
    return NextResponse.json({ error: 'invalid-link' }, { status: 400 })
  }

  const { data: deletionRequest } = await supabaseAdmin
    .from('account_deletion_requests')
    .select('user_id, expires_at, status')
    .eq('token', token)
    .single()

  if (!deletionRequest) {
    return NextResponse.json({ error: 'invalid-link' }, { status: 400 })
  }

  if (deletionRequest.status !== 'pending') {
    return NextResponse.json({ error: 'already-processed' }, { status: 409 })
  }

  if (new Date(deletionRequest.expires_at) < new Date()) {
    return NextResponse.json({ error: 'link-expired' }, { status: 410 })
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
    return NextResponse.json({ error: 'cancel-subscription-first' }, { status: 400 })
  }

  // Mark as completed before deletion to prevent race conditions (double
  // submit). If the delete fails, revert to pending so it can be retried.
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
    return NextResponse.json({ error: 'deletion-failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
