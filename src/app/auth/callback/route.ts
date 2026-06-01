import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Supabase redirects here after magic link click
// Exchanges the code in the URL for a session
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/membership'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Detect recovery session: next param or recovery_sent_at within last 30 minutes
      const sentAt = data?.session?.user?.recovery_sent_at
      const recentRecovery = sentAt
        ? Date.now() - new Date(sentAt).getTime() < 30 * 60 * 1000
        : false
      const destination = (next === '/update-password' || recentRecovery)
        ? '/update-password'
        : next
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  // No code or exchange failed — redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
