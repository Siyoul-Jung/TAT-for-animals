'use client'

import Link from 'next/link'
import ManageSubscriptionButton from './ManageSubscriptionButton'

type Props = {
  email: string
  fullName: string
  role: string
  subscriptionStatus: string
  hasSubscription: boolean
  currentPeriodEnd: string | null
}

const PLAN_INFO: Record<string, { name: string; price: string }> = {
  subscriber:     { name: 'Help Yourself',        price: '$24 / month' },
  pro_subscriber: { name: 'Professional Support', price: '$47 / month' },
}

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  active:   { label: 'Active',    classes: 'bg-green-100 text-green-800' },
  past_due: { label: 'Past Due',  classes: 'bg-red-100 text-red-800' },
  inactive: { label: 'Inactive',  classes: 'bg-charcoal/10 text-charcoal/50' },
}

function formatPeriodEnd(iso: string | null): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function DashboardClient({
  email,
  fullName,
  role,
  subscriptionStatus,
  hasSubscription,
  currentPeriodEnd,
}: Props) {
  const nextChargeDate = formatPeriodEnd(currentPeriodEnd)
  const displayName = fullName || email.split('@')[0]
  const plan = PLAN_INFO[role]
  const badge = STATUS_BADGE[subscriptionStatus] ?? STATUS_BADGE.inactive

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* 헤더 */}
        <div>
          <p className="text-sm font-medium text-charcoal/40 uppercase tracking-widest mb-1">
            My Account
          </p>
          <h1 className="font-serif text-3xl text-charcoal">
            Welcome back, {displayName}.
          </h1>
          <p className="text-charcoal/50 mt-1 text-base">{email}</p>
        </div>

        {/* 멤버십 카드 */}
        <section className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm space-y-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-charcoal/40">
            Your Membership
          </h2>

          {plan ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-xl text-charcoal">{plan.name}</p>
                  <p className="text-charcoal/50 mt-0.5 text-base">{plan.price}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.classes}`}>
                  {badge.label}
                </span>
              </div>

              {hasSubscription && (
                <div className="pt-4 border-t border-charcoal/8 space-y-3">
                  {nextChargeDate && (
                    <p className="text-base text-charcoal/60">
                      Next charge: <span className="text-charcoal font-medium">{nextChargeDate}</span>
                    </p>
                  )}
                  <ManageSubscriptionButton />
                  <p className="text-sm text-charcoal/40">
                    Cancel anytime · No questions asked
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-charcoal/60 text-base leading-relaxed">
                You don&apos;t have an active membership yet.
              </p>
              <Link
                href="/membership"
                className="inline-flex items-center min-h-[44px] px-7 py-3 rounded-full bg-brand text-cream text-base font-semibold hover:bg-brand-dark transition-all"
              >
                See Membership Options
              </Link>
            </div>
          )}
        </section>

        {/* 콘텐츠 (구독자만) */}
        {plan && (
          <section className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm space-y-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-charcoal/40">
              Your Content
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <ContentCard
                title="TAT for Animals"
                description="Video library for helping your animal find calm"
                href="/library/animals"
              />
              <ContentCard
                title="Healing ACEs"
                description="Self-guided practice videos for your own healing"
                href="/library/healing"
              />
              {role === 'pro_subscriber' && (
                <ContentCard
                  title="Live Webinars"
                  description="Monthly sessions with Tapas · Past recordings included"
                  href="/library/webinars"
                  badge="Pro"
                />
              )}
            </div>
          </section>
        )}

        {/* 계정 */}
        <section className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-charcoal/40 mb-4">
            Account
          </h2>
          <div className="divide-y divide-charcoal/8">
            <div className="py-3.5">
              <p className="text-sm text-charcoal/50">Email address</p>
              <p className="text-base text-charcoal mt-0.5">{email}</p>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm text-charcoal/50">Password</p>
                <p className="text-base text-charcoal mt-0.5">••••••••</p>
              </div>
              <Link
                href="/reset-password"
                className="text-sm text-brand hover:text-brand-dark font-medium min-h-[44px] flex items-center px-2"
              >
                Change
              </Link>
            </div>
          </div>
        </section>

        {/* 로그아웃 */}
        <div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-charcoal/40 hover:text-charcoal/70 transition-colors min-h-[44px]"
            >
              Sign out
            </button>
          </form>
        </div>

      </div>
    </main>
  )
}

function ContentCard({
  title,
  description,
  href,
  badge,
}: {
  title: string
  description: string
  href: string
  badge?: string
}) {
  return (
    <Link
      href={href}
      className="group block p-5 rounded-xl border border-charcoal/10 hover:border-brand/30 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="font-semibold text-charcoal group-hover:text-brand transition-colors">
          {title}
        </p>
        {badge && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand shrink-0">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-charcoal/55 leading-relaxed">{description}</p>
      <p className="mt-3 text-sm text-brand font-medium">Watch →</p>
    </Link>
  )
}
