'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

export default function ResetPasswordClient() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const supabase = createClient()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    })

    if (error) {
      // Supabase rate-limits repeat requests (~60s) to prevent abuse — this is
      // what "Didn't receive it? Try again" hits if clicked too soon. The old
      // generic message blamed the email address, which is misleading and was
      // reported as a confusing error during QA (Jez, 2026-07-02). Detection
      // uses the stable machine-readable codes from @supabase/auth-js
      // (error-codes.d.ts), not the English message text, so a Supabase copy
      // change can't silently break it; status 429 is the belt-and-suspenders.
      const isRateLimit =
        error.status === 429 ||
        error.code === 'over_email_send_rate_limit' ||
        error.code === 'over_request_rate_limit'
      if (isRateLimit) {
        setError("You've already requested a link recently. Please wait a minute and try again, or check your spam folder.")
      } else {
        // Don't blame the email address — a non-rate-limit failure here is
        // almost always on our side (network/config), not their typing.
        setError('Something went wrong on our end. Please try again in a moment.')
      }
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 pt-6 pb-16">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-surface p-10">
            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-charcoal mb-3">Check your inbox</h2>
            <p className="text-base text-muted leading-relaxed mb-2">
              We sent a password reset link to
            </p>
            <p className="text-base font-medium text-charcoal mb-8">{email}</p>
            <p className="text-xs text-muted mb-4">
              Didn't receive it?{' '}
              <button onClick={() => setSent(false)} className="text-green hover:underline">
                Try again
              </button>
            </p>
            <Link href="/login" className="inline-flex items-center min-h-[44px] text-sm text-muted hover:text-green transition-colors">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 pt-6 pb-16">
      <div className="w-full max-w-md">

        <Link href="/" className="flex flex-col items-center mb-10 group">
          <Image
            src="/images/logo2.png"
            alt="TAT for Animals"
            width={48}
            height={48}
            className="h-12 w-auto object-contain mb-1"
            style={{ width: 'auto' }}
          />
          <span className="font-serif text-xl text-charcoal/65 group-hover:text-green transition-colors">
            TAT<span className="text-green text-[11px] align-super">®</span> for Animals
          </span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-surface px-8 py-10">
          <h2 className="font-serif text-xl text-charcoal mb-2">Forgot your password?</h2>
          <p className="text-sm text-muted mb-8 leading-relaxed">
            Enter your email address and we'll send you a link to create a new password.
          </p>

          <form onSubmit={handleReset}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="your@email.com"
                className="w-full px-4 py-4 rounded-xl border border-surface bg-cream text-charcoal text-base placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
                {/* red-700, not red-600: 600 on red-50 is ~4.42:1, just under AA's
                    4.5:1 at this size — matches the dashboard's error box. */}
                <p className="text-sm text-red-700 leading-relaxed">{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-surface text-center">
            <Link href="/login" className="inline-flex items-center min-h-[44px] text-sm text-muted hover:text-green transition-colors">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
