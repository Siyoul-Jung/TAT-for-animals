'use client'

import { useState } from 'react'
import Link from 'next/link'
import ManageSubscriptionButton from './ManageSubscriptionButton'

type WebinarSession = {
  _id: string
  title: string
  date: string
  description: string | null
  meetingUrl: string | null
}

type Props = {
  email: string
  fullName: string
  role: string
  subscriptionStatus: string
  hasSubscription: boolean
  isPayPal: boolean
  currentPeriodEnd: string | null
  errorParam: string | null
  upcoming: WebinarSession[]
}

const PLAN_INFO: Record<string, { name: string; price: string }> = {
  subscriber:     { name: 'The Calm Library', price: '$27 / month' },
  pro_subscriber: { name: 'The Calm Circle',  price: '$47 / month' },
}

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  active:   { label: 'Active',    classes: 'bg-green-100 text-green-800' },
  past_due: { label: 'Past Due',  classes: 'bg-red-100 text-red-800' },
  inactive: { label: 'Inactive',  classes: 'bg-charcoal/10 text-charcoal/65' },
}

function formatPeriodEnd(iso: string | null): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  })
}

export default function DashboardClient({
  email,
  fullName,
  role,
  subscriptionStatus,
  hasSubscription,
  isPayPal,
  currentPeriodEnd,
  errorParam,
  upcoming,
}: Props) {
  const [changingPlan, setChangingPlan] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteRequested, setDeleteRequested] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const handlePayPalCancel = async () => {
    if (!window.confirm('Cancel your membership? You won’t be billed again, and your access will end.')) return
    setCancelling(true)
    try {
      const res = await fetch('/api/paypal/cancel', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not cancel your membership.')
      window.location.reload()
    } catch (err) {
      console.error('PayPal cancel error:', err)
      alert(err instanceof Error && err.message ? err.message : 'Something went wrong. Please try again.')
      setCancelling(false)
    }
  }

  const nextChargeDate = formatPeriodEnd(currentPeriodEnd)
  const displayName = fullName ? fullName.trim().split(/\s+/)[0] : null
  const plan = PLAN_INFO[role]
  const badge = STATUS_BADGE[subscriptionStatus] ?? STATUS_BADGE.inactive

  const handleChangePlan = async (targetTier: 'subscriber' | 'pro_subscriber') => {
    setChangingPlan(true)
    try {
      const res = await fetch('/api/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTier }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not change your plan')
      // Stripe → portal confirm screen; PayPal → approval screen
      window.location.href = data.url
    } catch (err) {
      console.error('Change plan error:', err)
      alert(err instanceof Error && err.message ? err.message : 'Something went wrong. Please try again.')
      setChangingPlan(false)
    }
  }

  const handleDeleteRequest = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/request-account-deletion', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit deletion request')
      setDeleteRequested(true)
    } catch (err) {
      console.error('Delete request error:', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
    <main className="min-h-screen bg-cream pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="text-sm font-medium text-charcoal/65 uppercase tracking-widest mb-1">
            Dashboard
          </p>
          <h1 className="text-2xl sm:text-3xl text-charcoal font-medium tracking-tight">
            {displayName ? (
              <>Good to see you, <span className="font-semibold">{displayName}</span>.</>
            ) : (
              'Good to see you.'
            )}
          </h1>
          <p className="text-charcoal/65 mt-1 text-base">{email}</p>
        </div>

        {/* Couldn't delete — subscription still active (redirected here from the delete-confirm link) */}
        {errorParam === 'cancel-subscription-first' && (
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-1">
            <h2 className="font-serif text-lg text-amber-900">
              Please cancel your membership first
            </h2>
            <p className="text-sm text-amber-800 leading-relaxed">
              Your account still has an active membership, so we couldn&apos;t delete it yet.
              Cancel below, then you can request deletion again.
            </p>
          </section>
        )}

        {/* Payment failed alert */}
        {subscriptionStatus === 'past_due' && (
          <section className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-3">
            <h2 className="font-serif text-lg text-red-800">
              We couldn&apos;t process your last payment.
            </h2>
            {isPayPal ? (
              <p className="text-sm text-red-700 leading-relaxed">
                Your access is paused until your payment goes through. Please update your
                payment method in your PayPal account. You can also cancel your membership below.
              </p>
            ) : (
              <>
                <p className="text-sm text-red-700 leading-relaxed">
                  Your access is paused until your payment goes through. Please update your
                  card to keep watching — it only takes a moment.
                </p>
                <ManageSubscriptionButton label="Update payment method" />
              </>
            )}
          </section>
        )}

        {/* Membership card */}
        <section className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm space-y-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-charcoal/65">
            Your Membership
          </h2>

          {plan ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-xl text-charcoal">{plan.name}</p>
                  <p className="text-charcoal/65 mt-0.5 text-base">{plan.price}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.classes}`}>
                  {badge.label}
                </span>
              </div>

              {hasSubscription && (
                <div className="pt-4 border-t border-charcoal/8 space-y-3">
                  {nextChargeDate && subscriptionStatus === 'active' && (
                    <p className="text-base text-charcoal/65">
                      Next charge: <span className="text-charcoal font-medium">{nextChargeDate}</span>
                    </p>
                  )}

                  {/* Switch plans in place — prorated, no cancel/rejoin */}
                  {subscriptionStatus === 'active' && (
                    role === 'pro_subscriber' ? (
                      <PlanSwitchButton
                        label="Switch to The Calm Library"
                        onClick={() => handleChangePlan('subscriber')}
                        loading={changingPlan}
                      />
                    ) : (
                      <PlanSwitchButton
                        label="Upgrade to The Calm Circle"
                        onClick={() => handleChangePlan('pro_subscriber')}
                        loading={changingPlan}
                      />
                    )
                  )}

                  {isPayPal ? (
                    <PayPalCancelButton onClick={handlePayPalCancel} loading={cancelling} />
                  ) : (
                    <ManageSubscriptionButton />
                  )}
                  <p className="text-sm text-charcoal/65 leading-relaxed">
                    Cancel anytime.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-charcoal/65 text-base leading-relaxed">
                You don&apos;t have an active membership yet.
              </p>
              <Link
                href="/membership#membership"
                className="inline-flex items-center min-h-[44px] px-7 py-3 rounded-full bg-brand text-cream text-base font-semibold hover:bg-brand-dark transition-all"
              >
                See Membership Options
              </Link>
            </div>
          )}
        </section>

        {/* Content (subscribers only) */}
        {plan && (
          <section className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm space-y-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-charcoal/65">
              Your Content
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ContentCard
                title="Library"
                description="TAT for Animals · Healing ACEs Plus"
                href="/library"
              />
              <ContentCard
                title="Live Sessions"
                description={role === 'pro_subscriber' ? 'Monthly sessions with Tapas · Past recordings included' : 'Connect live with Tapas every month for your animal—and for you'}
                href={role === 'pro_subscriber' ? '/library?tab=live' : ''}
                badge={role === 'pro_subscriber' ? 'The Calm Circle' : 'Pro members only'}
                locked={role !== 'pro_subscriber'}
                onClick={role !== 'pro_subscriber' ? () => handleChangePlan('pro_subscriber') : undefined}
                isLoading={changingPlan}
              />
            </div>
          </section>
        )}

        {/* Account */}
        <section className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-charcoal/65 mb-4">
            Account
          </h2>
          <div className="divide-y divide-charcoal/8">
            <div className="py-3.5">
              <p className="text-sm text-charcoal/65">Email address</p>
              <p className="text-base text-charcoal mt-0.5">{email}</p>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm text-charcoal/65">Password</p>
                <p className="text-base text-charcoal mt-0.5">••••••••</p>
              </div>
              <Link
                href="/reset-password"
                className="text-sm text-brand hover:text-brand-dark font-medium min-h-[44px] flex items-center px-2"
              >
                Change
              </Link>
            </div>
            <div className="py-3.5">
              <p className="text-sm text-charcoal/65">Delete account</p>
              {hasSubscription ? (
                <div className="mt-3 space-y-3">
                  <p className="text-sm text-charcoal/65 leading-relaxed">
                    Please cancel your membership first. You can do that here.
                  </p>
                  {isPayPal ? (
                    <PayPalCancelButton onClick={handlePayPalCancel} loading={cancelling} label="Cancel membership" />
                  ) : (
                    <ManageSubscriptionButton label="Manage subscription" />
                  )}
                </div>
              ) : deleteRequested ? (
                <p className="mt-3 text-sm text-charcoal/65 leading-relaxed">
                  Check your email — we sent a confirmation link to delete your account.
                </p>
              ) : (
                <button
                  onClick={handleDeleteRequest}
                  disabled={deleting}
                  className="mt-3 text-sm text-charcoal/65 hover:text-red-500 transition-colors font-medium min-h-[44px] disabled:opacity-50"
                >
                  {deleting ? 'Sending...' : 'Request account deletion →'}
                </button>
              )}
            </div>
            <div className="py-3.5">
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-charcoal/65 hover:text-charcoal transition-colors min-h-[44px]"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </section>

      </div>
    </main>

</>
  )
}

function PlanSwitchButton({
  label,
  onClick,
  loading,
}: {
  label: string
  onClick: () => void
  loading: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="min-h-[44px] flex items-center text-base font-medium text-brand hover:text-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? 'Loading…' : `${label} →`}
    </button>
  )
}

function PayPalCancelButton({
  onClick,
  loading,
  label = 'Cancel membership',
}: {
  onClick: () => void
  loading: boolean
  label?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="min-h-[44px] px-6 py-3 rounded-full border border-charcoal/20 text-charcoal/65 text-base font-medium hover:border-brand hover:text-brand transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Cancelling…' : label}
    </button>
  )
}

function ContentCard({
  title,
  description,
  href,
  badge,
  locked,
  onClick,
  isLoading,
}: {
  title: string
  description: string
  href: string
  badge?: string
  locked?: boolean
  onClick?: () => void
  isLoading?: boolean
}) {
  const cardClasses = `block p-5 rounded-xl border border-charcoal/10 transition-all`

  const titleClasses = `font-semibold transition-colors whitespace-nowrap ${
    locked ? 'text-charcoal/65' : 'text-charcoal'
  }`

  if (locked && onClick) {
    return (
      <div className={`${cardClasses} cursor-default`}>
        {badge && (
          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${
            locked
              ? 'bg-charcoal/10 text-charcoal/65'
              : 'bg-brand/10 text-brand'
          }`}>
            {badge}
          </span>
        )}
        <p className={titleClasses}>
          {title}
        </p>
        <p className="text-sm text-charcoal/65 leading-relaxed">{description}</p>
        <button
          onClick={onClick}
          disabled={isLoading}
          className="mt-3 text-sm font-medium text-brand hover:text-brand-dark transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Upgrading...' : 'Upgrade →'}
        </button>
      </div>
    )
  }

  return (
    <Link href={href} className={`group ${cardClasses} hover:border-brand/30 hover:shadow-md cursor-pointer`}>
      {badge && (
        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 bg-brand/10 text-brand`}>
          {badge}
        </span>
      )}
      <p className={titleClasses}>
        {title}
      </p>
      <p className="text-sm text-charcoal/65 leading-relaxed">{description}</p>
      <p className="mt-3 text-sm font-medium text-brand group-hover:text-brand-dark transition-colors">
        Watch →
      </p>
    </Link>
  )
}
