// The founding-member resubscribe page stays open for exactly one month after
// the site's public launch is announced (Jez/Tapas, confirmed 2026-09-01).
// WELCOME_BACK_ANNOUNCED_AT is unset until that announcement actually happens
// — while unset, the page stays open indefinitely (today's behavior). Once
// launch day is known, set it once and the page closes itself a month later
// with no further action needed.
const WINDOW_DAYS = 30

export function isWelcomeBackExpired(): boolean {
  const announcedAt = process.env.WELCOME_BACK_ANNOUNCED_AT
  if (!announcedAt) return false
  const announced = new Date(announcedAt)
  if (Number.isNaN(announced.getTime())) return false
  const expiresAt = announced.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000
  return Date.now() >= expiresAt
}
