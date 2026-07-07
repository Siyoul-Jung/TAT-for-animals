import { timingSafeEqual } from 'crypto'

// Verifies the Bearer token on Sanity-triggered endpoints (webinar-invite,
// recording-notification), which email every pro member when a webinar/recording
// is published.
//
// Fails CLOSED when SANITY_WEBHOOK_SECRET is unset. The previous inline check
// (`authHeader !== \`Bearer ${process.env.SANITY_WEBHOOK_SECRET}\``) compared
// against the literal string "Bearer undefined" if the env var was missing — so
// anyone sending `Authorization: Bearer undefined` would pass and trigger a mass
// email. Refusing when the secret is absent removes that bypass.
export function isAuthorizedSanityWebhook(authHeader: string | null): boolean {
  const secret = process.env.SANITY_WEBHOOK_SECRET
  if (!secret || !authHeader) return false

  const provided = Buffer.from(authHeader)
  const expected = Buffer.from(`Bearer ${secret}`)
  // timingSafeEqual throws on length mismatch, so guard length first; a differing
  // length already means "not equal".
  if (provided.length !== expected.length) return false
  return timingSafeEqual(provided, expected)
}
