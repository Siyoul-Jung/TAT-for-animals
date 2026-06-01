import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

  // Mark as completed before deletion to prevent race conditions
  await supabaseAdmin
    .from('account_deletion_requests')
    .update({ status: 'completed' })
    .eq('token', token)

  // Delete user — cascades to profiles via ON DELETE CASCADE
  await supabaseAdmin.auth.admin.deleteUser(deletionRequest.user_id)

  return NextResponse.redirect(`${siteUrl}/?deleted=true`)
}
