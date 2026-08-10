import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { PLAN_NAMES, type Plan } from '@/lib/plans'
import { isAuthorizedCronRequest } from '@/lib/cronAuth'
import { NextRequest, NextResponse } from 'next/server'

// Sends Jan/Jez a CSV of the current member list, so Jan can cross-check
// Stripe/PayPal payments against "is this person an active member" for
// revenue reconciliation without needing her own Supabase login (see
// docs/revenue-reconciliation-guide.docx, section 5). Cadence (vercel.json)
// and MEMBER_EXPORT_EMAIL are placeholders pending Jez's confirmation of
// what actually fits Jan's reconciliation rhythm — adjust both once she
// answers, this isn't meant to ship as-is.

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fail closed rather than guessing a recipient — this file contains every
  // member's email, unlike ops alerts where a fallback inbox is harmless.
  const recipients = (process.env.MEMBER_EXPORT_EMAIL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (recipients.length === 0) {
    console.error('member-export: MEMBER_EXPORT_EMAIL not set, skipping send')
    return NextResponse.json({ error: 'No recipients configured' }, { status: 500 })
  }

  const { data: members, error } = await supabaseAdmin
    .from('profiles')
    .select('full_name, email, role, subscription_status')
    .in('role', ['subscriber', 'pro_subscriber'])
    .order('full_name', { ascending: true })

  if (error) {
    console.error('member-export query failed:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  const rows = [
    ['Name', 'Email', 'Tier', 'Status'],
    ...(members ?? []).map((m) => [
      m.full_name ?? '',
      m.email ?? '',
      PLAN_NAMES[m.role as Plan] ?? m.role,
      m.subscription_status ?? '',
    ]),
  ]
  const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n')
  const today = new Date().toISOString().slice(0, 10)

  await resend.emails.send({
    from: FROM_EMAIL,
    to: recipients,
    subject: `TAT for Animals — member list (${today})`,
    text:
      `Attached is the current member list — name, email, tier, and status ` +
      `for every active member — for revenue reconciliation.\n\n` +
      `Questions about any row? Just reply to this email.`,
    attachments: [
      {
        filename: `tat-members-${today}.csv`,
        content: Buffer.from(csv, 'utf-8'),
        contentType: 'text/csv',
      },
    ],
  })

  return NextResponse.json({ sent: members?.length ?? 0 })
}
