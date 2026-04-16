import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: 'My Account | TAT® Calm',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, subscription_status, stripe_subscription_id, current_period_end')
    .eq('id', user.id)
    .single()

  return (
    <DashboardClient
      email={user.email ?? ''}
      fullName={profile?.full_name ?? ''}
      role={profile?.role ?? 'guest'}
      subscriptionStatus={profile?.subscription_status ?? 'inactive'}
      hasSubscription={!!profile?.stripe_subscription_id}
      currentPeriodEnd={profile?.current_period_end ?? null}
    />
  )
}
