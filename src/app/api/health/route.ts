import { NextResponse } from 'next/server'

// Lightweight liveness endpoint for uptime monitors (UptimeRobot / Pingdom / etc).
// Intentionally does NOT call Supabase / Stripe / Sanity — a health check that
// depends on third parties raises false alarms when a *dependency* blips rather
// than our app. This answers only "is the app process serving requests?".
export function GET() {
  return NextResponse.json(
    { status: 'ok', service: 'tat-for-animals' },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
