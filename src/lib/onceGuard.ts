import { supabaseAdmin } from '@/lib/supabase/admin'

// One-time guard backed by the `processed_webhook_events` table.
//
// The table is a generic once-only store, not just raw webhook IDs. Callers also
// use prefixed keys so an action runs exactly once:
//   <stripe/paypal event id>   — webhook idempotency
//   welcome-<subId>            — sendWelcomeOnce
//   paypal-success-<subId>     — PayPal return handler
//   renewal-reminder-<id>-<dt> — annual reminder cron
// A cleanup job must therefore NOT purge "old" rows blindly — it would re-open
// those guards (duplicate welcome emails, double reminders, reprocessed events).

// Claim an id. Returns alreadyProcessed=true only on a unique-violation (the id
// was already inserted). Any other insert error is ignored and the caller
// proceeds — preserving the webhooks' long-standing "skip only on duplicate"
// contract.
export async function claimOnce(id: string): Promise<{ alreadyProcessed: boolean }> {
  const { error } = await supabaseAdmin.from('processed_webhook_events').insert({ id })
  return { alreadyProcessed: error?.code === '23505' }
}

// Release a previously-claimed id so a retry can reprocess it — used when a
// handler throws after claiming, so a transient failure isn't permanently
// swallowed as "already processed".
export async function releaseOnce(id: string): Promise<void> {
  await supabaseAdmin.from('processed_webhook_events').delete().eq('id', id)
}
