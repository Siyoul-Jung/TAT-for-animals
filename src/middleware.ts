import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 로그인이 필요한 경로
const PROTECTED_PATHS = ['/dashboard', '/library']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))

  if (!isProtected) {
    return NextResponse.next({ request })
  }

  // 보호 경로에서만 인증 확인
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  // Only run on the protected paths the middleware actually guards. The previous
  // catch-all matcher forced *every* request (home, membership, login…) through the
  // Edge function just to early-return next(), adding latency and blocking pure
  // static CDN serving. Public pages now skip middleware entirely — same behaviour
  // (it never did auth work for them), lower TTFB.
  matcher: ['/dashboard', '/dashboard/:path*', '/library', '/library/:path*'],
}
