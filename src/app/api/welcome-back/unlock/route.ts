import { checkRateLimit, getClientIp, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'
import { NextRequest, NextResponse } from 'next/server'

// Shared-password gate for the founding-member resubscribe page (Jez asked,
// 2026-08-28, for the page to be "private and accessible only with a
// password"). One password for everyone on the invite list — not per-user
// auth — so this just sets a plain marker cookie once the password matches.
const COOKIE_NAME = 'welcome_back_unlocked'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 60 // 60 days — long enough to outlast a slow signup

export async function POST(request: NextRequest) {
  // Bound password-guessing attempts against this endpoint.
  if (!(await checkRateLimit('welcome-back-unlock', getClientIp(request), 10, 600))) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
  }

  const expected = process.env.RESUBSCRIBE_PAGE_PASSWORD
  if (!expected) {
    return NextResponse.json({ error: 'This page is not set up yet.' }, { status: 500 })
  }

  const { password } = await request.json()
  if (password !== expected) {
    return NextResponse.json({ error: "That password doesn't match — please try again." }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, '1', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/welcome-back',
  })
  return response
}
