import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { welcomeEmail } from '@/lib/emails/welcome'

// Send the welcome email exactly once per subscription — no matter which path
// activates the member (Stripe/PayPal webhook, PayPal return handler, thank-you
// verify, or dashboard self-heal). Without a shared guard, two paths racing the
// same activation (e.g. a late webhook after self-heal already ran) would each
// send a welcome.
//
// The guard reuses processed_webhook_events as a generic once-only store: insert
// a stable `welcome-<subscriptionId>` marker first; a duplicate-key conflict
// (23505) means it already went out, so we skip. If the send itself fails, we
// remove the marker so a later path can retry instead of the email being lost.
export async function sendWelcomeOnce(opts: {
  subscriptionId: string | null | undefined
  email: string | null | undefined
  name: string | null | undefined
  role: 'subscriber' | 'pro_subscriber'
}): Promise<void> {
  const { subscriptionId, email, name, role } = opts
  if (!email || !subscriptionId) return

  const guardId = `welcome-${subscriptionId}`
  const { error: guardError } = await supabaseAdmin
    .from('processed_webhook_events')
    .insert({ id: guardId })
  if (guardError?.code === '23505') return // already sent

  try {
    const { subject, html } = welcomeEmail(name ?? null, role)
    await resend.emails.send({ from: FROM_EMAIL, to: email, subject, html })
  } catch (e) {
    console.error('Welcome email failed:', e)
    // Roll back the marker so another path can retry (harmless if it was never
    // inserted because of a non-conflict guard error above).
    await supabaseAdmin.from('processed_webhook_events').delete().eq('id', guardId)
  }
}
