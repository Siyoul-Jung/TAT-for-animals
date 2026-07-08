'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const ERROR_COPY: Record<string, string> = {
  'invalid-link': "This link isn't valid. Please request account deletion again from your dashboard.",
  'already-processed': 'This request was already handled — your account may already be deleted.',
  'link-expired': 'This link has expired (links are valid for 24 hours). Please request deletion again from your dashboard.',
  'cancel-subscription-first': 'Please cancel your subscription first, then request deletion again from your dashboard.',
  'deletion-failed': "Something went wrong on our end and your account wasn't deleted. Please try again, or email us at hello@tatforanimals.com.",
  network: "We couldn't reach our server. Please check your connection and try again.",
}

function ConfirmDeletion() {
  const token = useSearchParams().get('token')
  const [status, setStatus] = useState<'idle' | 'deleting' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setStatus('deleting')
    setError(null)
    try {
      const res = await fetch('/api/confirm-account-deletion', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(ERROR_COPY[data?.error] ?? ERROR_COPY['deletion-failed'])
        setStatus('idle')
        return
      }
      setStatus('done')
    } catch {
      setError(ERROR_COPY.network)
      setStatus('idle')
    }
  }

  // Success screen
  if (status === 'done') {
    return (
      <Shell heading="Your account has been deleted.">
        <p className="text-charcoal/65 text-base leading-relaxed">
          Thank you for being part of TAT for Animals. We&apos;re sorry to see you go.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-full font-bold text-[19px] text-cream transition-all hover:opacity-90"
          style={{ backgroundColor: '#D4703A' }}
        >
          Return home
        </Link>
      </Shell>
    )
  }

  // Missing token — nothing to confirm
  if (!token) {
    return (
      <Shell heading="This link isn't valid.">
        <p className="text-charcoal/65 text-base leading-relaxed">
          Please request account deletion again from your dashboard.
        </p>
        <Link href="/dashboard" className="text-green hover:underline font-medium">
          Go to my account
        </Link>
      </Shell>
    )
  }

  return (
    <Shell heading="Delete your account?">
      <p className="text-charcoal/65 text-base leading-relaxed">
        This permanently deletes your TAT for Animals account and all of your data.
        <span className="block mt-1 font-medium text-charcoal">This cannot be undone.</span>
      </p>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-left">
          <p className="text-sm text-red-700 leading-relaxed">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2">
        <button
          onClick={handleDelete}
          disabled={status === 'deleting'}
          className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-full font-semibold text-base text-cream transition-all hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#B23B2E' }}
        >
          {status === 'deleting' ? 'Deleting…' : 'Yes, delete my account'}
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center min-h-[48px] text-base font-medium text-charcoal/70 hover:text-charcoal transition-colors"
        >
          No, keep my account
        </Link>
      </div>
    </Shell>
  )
}

function Shell({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 pt-24 pb-16">
      <div className="w-full max-w-md text-center space-y-6">
        <p className="text-[13px] tracking-[0.2em] uppercase font-semibold" style={{ color: '#467826' }}>
          TAT for Animals
        </p>
        <h1 className="font-serif text-3xl text-charcoal leading-[1.2]">{heading}</h1>
        {children}
      </div>
    </main>
  )
}

export default function ConfirmAccountDeletionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <ConfirmDeletion />
    </Suspense>
  )
}
