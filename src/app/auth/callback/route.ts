import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Magic Link 클릭 후 Supabase가 이 경로로 리다이렉트함
// URL에 담긴 code를 세션으로 교환하는 역할
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // recovery 세션 감지: next 파라미터 or recovery_sent_at이 최근 30분 이내
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

  // 코드가 없거나 교환 실패 시 로그인 페이지로
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
