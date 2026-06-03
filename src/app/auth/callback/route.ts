import { createClient } from '@/lib/supabase/server'
import { safeNextPath } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

// Supabase redirects here after magic link click
// Exchanges the code in the URL for a session
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNextPath(searchParams.get('next'), '/membership')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Password recovery flow passes next=/update-password explicitly.
      // Everything else (magic link, email confirmation) uses next as-is.
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // No code or exchange failed — redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
