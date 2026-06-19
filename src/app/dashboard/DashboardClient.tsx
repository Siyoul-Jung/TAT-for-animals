'use client'

import { useState } from 'react'
import Link from 'next/link'
import ManageSubscriptionButton from './ManageSubscriptionButton'
import { BOOKING_URL } from '@/lib/links'
import { createClient } from '@/lib/supabase/client'

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
  pendingTier: string | null
  pendingTierAt: string | null
  cancelAt: string | null
  errorParam: string | null
  planChanged: boolean
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
  pendingTier,
  pendingTierAt,
  cancelAt,
  errorParam,
  planChanged,
  upcoming,
}: Props) {
  const [changingPlan, setChangingPlan] = useState(false)
  // Upgrade now charges immediately (we replaced Stripe's hosted confirm screen
  // with our own), so the first click opens a plain-language confirm — which
  // fetches the prorated amount due today so we can show it before charging.
  const [confirmingUpgrade, setConfirmingUpgrade] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewAmount, setPreviewAmount] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteRequested, setDeleteRequested] = useState(false)
  // Account deletion is destructive, so the first click only opens an inline
  // confirm (mirrors the PayPal cancel step) — it must not fire the email outright.
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  // Action failures (cancel / change plan / delete) surface as a calm inline box, not a native alert().
  const [actionError, setActionError] = useState<string | null>(null)
  // PayPal cancel uses an inline confirm step (no native window.confirm()).
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  // Password change: a logged-in user's email is already verified, so we skip the
  // re-entry form and send the reset link straight to it (mirrors the delete flow).
  const [sendingReset, setSendingReset] = useState(false)
  const [passwordResetSent, setPasswordResetSent] = useState(false)

  // First click opens the inline confirm; confirmPayPalCancel does the actual work.
  const handlePayPalCancel = () => {
    setActionError(null)
    setConfirmingCancel(true)
  }

  const confirmPayPalCancel = async () => {
    setCancelling(true)
    setActionError(null)
    try {
      const res = await fetch('/api/paypal/cancel', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not cancel your membership.')
      window.location.reload()
    } catch (err) {
      console.error('PayPal cancel error:', err)
      setActionError(err instanceof Error && err.message ? err.message : 'Something went wrong on our end. Please try again in a moment.')
      setConfirmingCancel(false)
      setCancelling(false)
    }
  }

  const nextChargeDate = formatPeriodEnd(currentPeriodEnd)
  const displayName = fullName ? fullName.trim().split(/\s+/)[0] : null
  const plan = PLAN_INFO[role]
  const badge = STATUS_BADGE[subscriptionStatus] ?? STATUS_BADGE.inactive
  const pendingPlan = pendingTier ? PLAN_INFO[pendingTier] : null
  const pendingDate = formatPeriodEnd(pendingTierAt)
  const isCancelling = !!cancelAt
  const cancelDate = formatPeriodEnd(cancelAt)

  const handleChangePlan = async (targetTier: 'subscriber' | 'pro_subscriber') => {
    setChangingPlan(true)
    setActionError(null)
    try {
      const res = await fetch('/api/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTier }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not change your plan')
      // PayPal returns an approval URL to redirect to; Stripe applies the
      // upgrade server-side and returns { ok: true } — reload to show Pro.
      if (data.url) {
        window.location.href = data.url
        return
      }
      window.location.reload()
    } catch (err) {
      console.error('Change plan error:', err)
      setActionError(err instanceof Error && err.message ? err.message : 'Something went wrong on our end. Please try again in a moment.')
      setChangingPlan(false)
    }
  }

  // Ask the server for the prorated amount due today (Stripe preview), so the
  // confirm box can show it before charging. On failure we leave it null and the
  // box falls back to generic copy.
  const fetchUpgradePreview = async () => {
    setPreviewLoading(true)
    setPreviewAmount(null)
    try {
      const res = await fetch('/api/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTier: 'pro_subscriber', preview: true }),
      })
      const data = await res.json()
      if (res.ok && typeof data.amountDue === 'number') {
        const cur = (data.currency || 'usd').toUpperCase()
        const value = (data.amountDue / 100).toFixed(2)
        setPreviewAmount(cur === 'USD' ? `$${value}` : `${value} ${cur}`)
      }
    } catch {
      // Leave previewAmount null → confirm box uses the generic wording.
    } finally {
      setPreviewLoading(false)
    }
  }

  // Both upgrade entry points — the membership CTA and the locked "Live Sessions"
  // content card — open the same confirm box in the membership section, so the
  // charge always goes through one confirmed path (and the two buttons no longer
  // share a loading state).
  const openUpgrade = (scroll = false) => {
    setConfirmingUpgrade(true)
    setActionError(null)
    // PayPal can't be previewed (the price is confirmed on PayPal's own screen),
    // so only fetch a proration amount for Stripe members.
    if (!isPayPal) fetchUpgradePreview()
    if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleChangePassword = async () => {
    setSendingReset(true)
    setActionError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      })
      if (error) throw error
      setPasswordResetSent(true)
    } catch (err) {
      console.error('Password reset error:', err)
      setActionError('Something went wrong on our end. Please try again in a moment.')
    } finally {
      setSendingReset(false)
    }
  }

  const handleDeleteRequest = async () => {
    setDeleting(true)
    setActionError(null)
    try {
      const res = await fetch('/api/request-account-deletion', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit deletion request')
      setDeleteRequested(true)
    } catch (err) {
      console.error('Delete request error:', err)
      setActionError('Something went wrong on our end. Please try again in a moment.')
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
          <p className="text-sm font-medium text-green uppercase tracking-widest mb-1">
            Dashboard
          </p>
          <h1 className="text-2xl sm:text-3xl text-charcoal font-medium tracking-tight">
            {displayName ? (
              <>Good to see you, <span className="font-semibold">{displayName}</span>.</>
            ) : (
              'Good to see you.'
            )}
          </h1>
        </div>

        {/* Action error (cancel / change plan / delete) — calm inline box instead of a native alert().
            Dismissible so a one-off failure doesn't linger at the top of the page. */}
        {actionError && (
          <section role="alert" className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 flex items-start gap-3">
            <p className="text-sm text-red-700 leading-relaxed flex-1">{actionError}</p>
            <button
              onClick={() => setActionError(null)}
              aria-label="Dismiss"
              className="shrink-0 -mr-1 -mt-1 w-9 h-9 flex items-center justify-center text-red-700/60 hover:text-red-700 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </section>
        )}

        {/* PayPal cancel — inline confirm step (replaces native window.confirm) */}
        {confirmingCancel && (
          <section className="rounded-2xl border border-charcoal/10 bg-cream px-6 py-4 space-y-3">
            <p className="text-sm text-charcoal/80 leading-relaxed">
              Cancel your membership? You won&apos;t be billed again, and you&apos;ll keep access until your current period ends.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <button
                onClick={confirmPayPalCancel}
                disabled={cancelling}
                className="min-h-[44px] flex items-center text-base font-medium text-green hover:text-green transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {cancelling ? 'Cancelling…' : 'Yes, cancel'}
              </button>
              <button
                onClick={() => setConfirmingCancel(false)}
                disabled={cancelling}
                className="min-h-[44px] flex items-center text-sm text-charcoal/70 hover:text-charcoal/90 transition-colors disabled:opacity-50"
              >
                Keep my membership
              </button>
            </div>
          </section>
        )}

        {/* Plan change confirmed (redirected here from a PayPal plan switch) */}
        {planChanged && (
          <section className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4">
            <p className="text-sm text-green-800 leading-relaxed">
              Your plan change is confirmed. It may take a moment to update on this page.
            </p>
          </section>
        )}

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
                payment method in your PayPal account.{!isCancelling && ' You can also cancel your membership below.'}
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
          <h2 className="text-xs font-semibold uppercase tracking-widest text-green">
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

                  {/* Cancellation scheduled — reassure the member their access
                      continues until the paid period ends, then stops. Plan
                      switches are hidden (contradictory while cancelling); Manage
                      Subscription stays so they can turn auto-renew back on. */}
                  {isCancelling && plan && (
                    <div className="rounded-xl border border-charcoal/10 bg-cream p-4">
                      <p className="text-sm text-charcoal/80 leading-relaxed">
                        Your membership stays active until{' '}
                        <span className="whitespace-nowrap font-medium text-charcoal">{cancelDate}</span>
                        {' '}— then it ends.
                        {isPayPal ? (
                          <>
                            {' '}You&apos;re welcome to{' '}
                            <Link href="/membership" className="text-green underline hover:text-green">
                              rejoin
                            </Link>
                            {' '}anytime.
                          </>
                        ) : (
                          ' You can turn it back on anytime in Manage Subscription before then.'
                        )}
                      </p>
                    </div>
                  )}

                  {/* A downgrade is already scheduled for the end of the paid
                      period — reassure the member they keep their current plan
                      until then (lead with what they KEEP, not the change). */}
                  {subscriptionStatus === 'active' && !isCancelling && pendingPlan && plan && (
                    <div className="rounded-xl border border-charcoal/10 bg-cream p-4">
                      <p className="text-sm text-charcoal/80 leading-relaxed">
                        You&apos;ll keep <span className="font-medium text-charcoal">{plan.name}</span> until{' '}
                        <span className="whitespace-nowrap font-medium text-charcoal">{pendingDate}</span>
                        {' '}— then it switches to{' '}
                        <span className="font-medium text-charcoal">{pendingPlan.name}</span>.
                      </p>
                    </div>
                  )}

                  {/* Upgrade (Library → Circle). First click opens a plain-language
                      confirm — the change is immediate and charges a prorated
                      amount, so we say so before doing it. */}
                  {subscriptionStatus === 'active' && !isCancelling && !pendingPlan && role !== 'pro_subscriber' && (
                    confirmingUpgrade ? (
                      <div
                        className="rounded-2xl border p-5 space-y-4"
                        style={{ backgroundColor: 'rgba(212,112,58,0.05)', borderColor: 'rgba(212,112,58,0.20)' }}
                      >
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <p className="font-serif text-lg text-charcoal leading-snug">
                              Move up to The Calm Circle
                            </p>
                            <p className="text-sm text-charcoal/70 leading-relaxed">
                              {isPayPal
                                ? 'Live sessions with Tapas. You’ll confirm the new price with PayPal on the next screen.'
                                : 'Live sessions with Tapas, starting today.'}
                            </p>
                          </div>
                          <dl className="text-sm space-y-1.5">
                            {/* Stripe shows today's prorated charge; PayPal can't be
                                previewed, so we only state the ongoing price. */}
                            {!isPayPal && (
                              <div className="flex gap-4">
                                <dt className="w-16 shrink-0 text-charcoal/60">Today</dt>
                                <dd className="font-medium text-charcoal">
                                  {previewLoading ? 'Working it out…' : (previewAmount ?? 'Just the difference')}
                                </dd>
                              </div>
                            )}
                            <div className="flex gap-4">
                              <dt className="w-16 shrink-0 text-charcoal/60">Monthly</dt>
                              <dd className="font-medium text-charcoal">$47</dd>
                            </div>
                          </dl>
                        </div>
                        <div className="flex flex-col items-stretch sm:items-start gap-1 pt-1">
                          <button
                            onClick={() => handleChangePlan('pro_subscriber')}
                            disabled={changingPlan}
                            className="w-full sm:w-auto inline-flex justify-center items-center whitespace-nowrap min-h-[48px] px-7 rounded-full text-cream font-bold text-[19px] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#D4703A', boxShadow: '0 6px 20px rgba(212,112,58,0.25)' }}
                          >
                            {changingPlan ? 'Upgrading…' : 'Confirm upgrade →'}
                          </button>
                          <button
                            onClick={() => setConfirmingUpgrade(false)}
                            disabled={changingPlan}
                            className="w-full sm:w-auto min-h-[44px] flex items-center justify-center sm:justify-start text-sm text-charcoal/70 hover:text-charcoal/90 transition-colors disabled:opacity-50"
                          >
                            Not now
                          </button>
                        </div>
                      </div>
                    ) : (
                      <PlanSwitchButton
                        label="Upgrade to The Calm Circle"
                        onClick={() => openUpgrade()}
                        loading={false}
                      />
                    )
                  )}

                  {isPayPal ? (
                    /* No resume path for PayPal — hide the cancel button once a
                       cancellation is already pending (the note explains it). */
                    !isCancelling && (
                      <PayPalCancelButton onClick={handlePayPalCancel} loading={cancelling} />
                    )
                  ) : (
                    /* Stripe: Manage stays so the member can resume before period end. */
                    <ManageSubscriptionButton />
                  )}

                  {/* PayPal holds the card in the member's PayPal account, not
                      here — point them there so they don't cancel just to change
                      a card. (Stripe members update it inside Manage Subscription.) */}
                  {isPayPal && subscriptionStatus === 'active' && !isCancelling && (
                    <p className="text-sm text-charcoal/65 leading-relaxed">
                      To change your payment method, manage it in your{' '}
                      <a
                        href="https://www.paypal.com/myaccount/autopay/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green hover:text-green underline"
                      >
                        PayPal account
                      </a>
                      .
                    </p>
                  )}

                  {/* Downgrade is handled by support, not self-service (rare, and
                      the self-service period-end schedule adds fragile state).
                      Kept visible as a quiet link — not hidden — so a member
                      weighing cancellation sees a cheaper option first. Jez makes
                      the change in Stripe and the webhook syncs the role. */}
                  {subscriptionStatus === 'active' && !isCancelling && !pendingPlan && role === 'pro_subscriber' && (
                    <Link
                      href="/contact"
                      className="flex items-center min-h-[44px] text-sm text-charcoal/70 hover:text-charcoal/90 transition-colors"
                    >
                      Prefer a smaller plan? Contact us to switch →
                    </Link>
                  )}

                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-charcoal/80 text-base leading-relaxed">
                Ready to begin? Choose a plan to open the library.
              </p>
              <Link
                href="/membership"
                className="inline-flex items-center min-h-[44px] px-7 py-3 rounded-full bg-brand text-white text-[19px] font-bold hover:opacity-90 transition-all whitespace-nowrap"
              >
                See plans
              </Link>
            </div>
          )}
        </section>

        {/* Content (subscribers only) */}
        {plan && (
          <section className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm space-y-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-green">
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
                onClick={role !== 'pro_subscriber' ? () => openUpgrade(true) : undefined}
                isLoading={false}
              />
            </div>
            {/* Quiet 1:1 booking entry for members — the warmest audience for a private session,
                placed gently (no payment pressure). Green is AA-legible on this light card.
                Placeholder copy pending Tapas's wording; URL shared via lib/links. */}
            <p className="text-sm text-charcoal/65 leading-relaxed">
              Want personal, hands-on guidance?{' '}
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2 hover:opacity-70 transition-opacity"
                style={{ color: '#467826' }}
              >
                Book a private session with Tapas →
              </a>
            </p>
          </section>
        )}

        {/* Account */}
        <section className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-green mb-4">
            Account
          </h2>
          <div className="divide-y divide-charcoal/8">
            <div className="py-3.5">
              <p className="text-sm text-charcoal/65">Email address</p>
              <p className="text-base text-charcoal mt-0.5">{email}</p>
            </div>
            <div className="py-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal/65">Password</p>
                  <p className="text-base text-charcoal mt-0.5">••••••••</p>
                </div>
                {!passwordResetSent && (
                  <button
                    onClick={handleChangePassword}
                    disabled={sendingReset}
                    className="text-sm text-green hover:text-green font-medium underline underline-offset-2 min-h-[44px] flex items-center px-2 disabled:opacity-50"
                  >
                    {sendingReset ? 'Sending…' : 'Change'}
                  </button>
                )}
              </div>
              {passwordResetSent && (
                <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <svg className="w-5 h-5 shrink-0 mt-0.5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <div>
                    <p className="text-sm text-green-800 leading-relaxed">
                      We&apos;ve emailed you a link to set a new password. Check your inbox.
                    </p>
                    <button
                      onClick={handleChangePassword}
                      disabled={sendingReset}
                      className="inline-flex items-center min-h-[44px] text-sm font-medium text-green-800 underline underline-offset-2 hover:no-underline disabled:opacity-50"
                    >
                      {sendingReset ? 'Sending…' : "Didn't receive it? Send again"}
                    </button>
                  </div>
                </div>
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
            <div className="py-3.5">
              {hasSubscription ? (
                <div className="space-y-3">
                  <p className="text-sm text-charcoal/65 leading-relaxed">
                    To delete your account, please cancel your membership first.
                  </p>
                  {isPayPal ? (
                    <PayPalCancelButton onClick={handlePayPalCancel} loading={cancelling} label="Cancel membership" />
                  ) : (
                    <ManageSubscriptionButton label="Manage subscription" />
                  )}
                </div>
              ) : deleteRequested ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <svg className="w-5 h-5 shrink-0 mt-0.5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <p className="text-sm text-green-800 leading-relaxed">
                      Check your email — we sent a link to confirm deleting your account.
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteRequest}
                    disabled={deleting}
                    className="text-sm min-h-[44px] disabled:opacity-50"
                  >
                    {deleting ? (
                      <span className="text-green font-medium">Sending…</span>
                    ) : (
                      <>
                        <span className="text-charcoal/65">Didn&apos;t receive it? </span>
                        <span className="text-green font-medium underline underline-offset-2">Send again</span>
                      </>
                    )}
                  </button>
                </div>
              ) : confirmingDelete ? (
                <div className="rounded-xl border border-charcoal/10 bg-cream px-4 py-3 space-y-3">
                  <p className="text-sm text-charcoal/80 leading-relaxed">
                    Delete your account? We&apos;ll email you a link to confirm.
                  </p>
                  <div className="flex flex-col items-start gap-1">
                    <button
                      onClick={handleDeleteRequest}
                      disabled={deleting}
                      className="min-h-[44px] flex items-center text-sm font-medium text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      {deleting ? 'Sending…' : 'Yes, email me the link'}
                    </button>
                    <button
                      onClick={() => setConfirmingDelete(false)}
                      disabled={deleting}
                      className="min-h-[44px] flex items-center text-sm text-charcoal/70 hover:text-charcoal/90 transition-colors disabled:opacity-50"
                    >
                      Keep my account
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="text-sm text-charcoal/65 hover:text-red-500 transition-colors font-medium min-h-[44px]"
                >
                  Delete account
                </button>
              )}
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
      className="min-h-[44px] flex items-center text-base font-medium text-green hover:text-green transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
      className="min-h-[44px] px-6 py-3 rounded-full border border-charcoal/20 text-charcoal/65 text-base font-medium hover:border-brand hover:text-green transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              : 'bg-brand/10 text-green'
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
          className="mt-3 text-sm font-medium text-green hover:text-green transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Upgrading...' : 'Upgrade →'}
        </button>
      </div>
    )
  }

  return (
    <Link href={href} className={`group ${cardClasses} hover:border-brand/30 hover:shadow-md cursor-pointer`}>
      {badge && (
        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 bg-brand/10 text-green`}>
          {badge}
        </span>
      )}
      <p className={titleClasses}>
        {title}
      </p>
      <p className="text-sm text-charcoal/65 leading-relaxed">{description}</p>
      <p className="mt-3 text-sm font-medium text-green group-hover:text-green transition-colors">
        Watch →
      </p>
    </Link>
  )
}
