import { resend, FROM_EMAIL } from '@/lib/resend'

// Where operational failure alerts go. Comma-separated for multiple inboxes
// (e.g. "dev@x.com, hello@tatforanimals.com"). Falls back to the site owner if
// OPS_ALERT_EMAIL isn't set, so alerting works even before that env is added.
const ALERT_TO = (process.env.OPS_ALERT_EMAIL || 'philoleben@gmail.com')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

// Best-effort in-process throttle so a provider outage that fails many webhooks
// at once doesn't send hundreds of emails. Keyed by scope, one alert per window
// per warm serverless instance. Imperfect across instances, but bounded and
// dependency-free — the goal is "someone finds out", not perfect dedupe.
const THROTTLE_MS = 5 * 60 * 1000
const lastAlertAt = new Map<string, number>()

/**
 * Report a critical server-side failure: always logs, and emails the ops inbox
 * so a production failure (webhook / payment / account deletion) is visible
 * immediately instead of being buried in ephemeral function logs.
 *
 * Never throws and never blocks meaningfully — call it from a catch block on a
 * critical path. If the alert email itself can't be sent, the console.error
 * still lands.
 */
export async function reportOpsError(
  scope: string,
  error: unknown,
  context?: Record<string, unknown>
): Promise<void> {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  console.error(`[ops:${scope}]`, message, context ?? '')

  try {
    const now = Date.now()
    const last = lastAlertAt.get(scope)
    if (last !== undefined && now - last < THROTTLE_MS) return
    lastAlertAt.set(scope, now)

    const contextBlock = context ? `\n\nContext:\n${JSON.stringify(context, null, 2)}` : ''
    const stackBlock = error instanceof Error && error.stack ? `\n\n${error.stack}` : ''

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ALERT_TO,
      subject: `⚠️ TAT ops alert — ${scope}`,
      text:
        `A failure occurred in "${scope}" on the TAT for Animals site.\n\n` +
        `${message}${contextBlock}${stackBlock}\n\n` +
        `(Further "${scope}" alerts are muted for a few minutes to avoid a storm.)`,
    })
  } catch {
    // Alerting must never throw or affect the request path — the console.error
    // above is the guaranteed record.
  }
}
