import { NextRequest, NextResponse } from 'next/server'

// Collects Content-Security-Policy violation reports (the `report-uri` in
// next.config.ts). The policy ships Report-Only: browsers POST here whenever a
// page does something the policy WOULD block, so gaps surface in the Vercel
// function logs from real browsing — instead of only in whatever console
// happens to be open. Check these logs are quiet across checkout (Stripe +
// PayPal), video playback, and /studio before promoting the policy to
// enforcing. No storage, no email — a single misbehaving browser extension can
// fire hundreds of reports.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Legacy report-uri shape is {"csp-report": {...}}; tolerate raw objects too.
    const report = body?.['csp-report'] ?? body
    console.warn('[csp-report]', JSON.stringify(report))
  } catch {
    // Unparseable report — nothing actionable.
  }
  return new NextResponse(null, { status: 204 })
}
