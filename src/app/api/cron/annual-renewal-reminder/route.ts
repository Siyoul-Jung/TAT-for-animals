import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { annualRenewalReminderEmail } from '@/lib/emails/annual-renewal-reminder'
import { isAuthorizedCronRequest } from '@/lib/cronAuth'
import { NextRequest, NextResponse } from 'next/server'

// Daily cron: remind annual members ~30 days before their yearly charge.
//
// Annual members pay a large amount once a year, so a heads-up before the charge
// cuts down on surprise-charge disputes — and for a one-year auto-renewing term
// California law *requires* the reminder to land "at least 15 days and not more
// than 45 days before" the renewal (Cal. Bus. & Prof. Code §17602(b), Trigger 2).
// 30 days sits in the middle of that window, so even if a daily run is missed the
// notice still falls inside 15–45. Vercel Cron hits this once a day; the window +
// a once-per-cycle guard mean each renewal is reminded exactly once, on the first
// day it enters the window (~30 days out).

const DAYS_BEFORE = 30

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const windowEnd = new Date(now.getTime() + DAYS_BEFORE * 24 * 60 * 60 * 1000)

  // Active annual members whose renewal falls within the next DAYS_BEFORE days,
  // excluding anyone who's already cancelling (no renewal charge is coming).
  const { data: due, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role, current_period_end, stripe_subscription_id, paypal_subscription_id')
    .eq('billing_interval', 'year')
    .eq('subscription_status', 'active')
    .is('cancel_at', null)
    .gte('current_period_end', now.toISOString())
    .lte('current_period_end', windowEnd.toISOString())

  if (error) {
    console.error('Renewal reminder query failed:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  let sent = 0
  for (const member of due ?? []) {
    if (!member.email || !member.current_period_end) continue
    if (member.role !== 'subscriber' && member.role !== 'pro_subscriber') continue

    // Once per renewal cycle: the period end is part of the key, so next year's
    // renewal (a different date) gets its own reminder.
    const subId = member.stripe_subscription_id ?? member.paypal_subscription_id ?? member.id
    const guardId = `renewal-reminder-${subId}-${member.current_period_end}`
    const { error: guardError } = await supabaseAdmin
      .from('processed_webhook_events')
      .insert({ id: guardId })
    if (guardError?.code === '23505') continue // already reminded this cycle

    try {
      const { subject, html } = annualRenewalReminderEmail(
        member.full_name,
        member.role,
        formatDate(member.current_period_end),
      )
      await resend.emails.send({ from: FROM_EMAIL, to: member.email, subject, html })
      sent += 1
    } catch (e) {
      console.error('Renewal reminder send failed:', e)
      // Roll back so the next daily run retries rather than skipping forever.
      await supabaseAdmin.from('processed_webhook_events').delete().eq('id', guardId)
    }
  }

  return NextResponse.json({ checked: due?.length ?? 0, sent })
}
