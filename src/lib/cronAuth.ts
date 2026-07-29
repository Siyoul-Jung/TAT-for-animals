import { timingSafeEqual } from 'crypto'
import { NextRequest } from 'next/server'

// Vercel attaches `Authorization: Bearer <CRON_SECRET>` to cron requests when
// CRON_SECRET is set. Shared by every /api/cron/* route so the check can't
// drift between them (previously duplicated per-route).
export function isAuthorizedCronRequest(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const provided = request.headers.get('authorization')
  if (!provided) return false
  // Constant-time compare (parity with sanityWebhookAuth) — avoids a timing
  // side-channel on the secret.
  const a = Buffer.from(provided)
  const b = Buffer.from(`Bearer ${secret}`)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
