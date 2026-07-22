'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { safeNextPath } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = safeNextPath(searchParams.get('next'))
  // A failed/expired magic-link or email-confirmation exchange sends the user here
  // with ?error=auth — surface it instead of showing a silent, blank form.
  const authError = searchParams.get('error') === 'auth'
  // Checkout bounced them here because their session lapsed mid-purchase. Reassure
  // them the redirect is expected and their payment will continue after sign-in.
  const resumeCheckout = searchParams.get('notice') === 'resume_checkout'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    // The usual causes (link opened in a different browser than the one that
    // signed up, or opened twice) fail only the sign-in handoff — the email
    // itself is verified server-side the moment the link is first opened. So
    // reassure + one action; no diagnostics. (Truly expired links are covered
    // too: the magic-link button sits right below.)
    authError
      ? 'That link couldn’t sign you in — but your email is most likely already confirmed. Just sign in below.'
      : null
  )
  const [magicSent, setMagicSent] = useState(false)

  const supabase = createClient()

  // Already signed in → skip the form, go where they were headed
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace(next)
    })
  }, [supabase, router, next])

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.code === 'email_not_confirmed') {
        setError("Please confirm your email first.\nCheck your inbox for the verification link we sent.")
      } else {
        setError("Incorrect email or password.\nTry again, or use a sign-in link below.")
      }
      setLoading(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  async function handleMagicLink() {
    if (!email) {
      setError('Enter your email address first, then we\'ll send you a sign-in link.')
      return
    }
    setMagicLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })

    if (error) {
      setError('Something went wrong. Please check your email address and try again.')
      setMagicLoading(false)
      return
    }

    setMagicSent(true)
    setMagicLoading(false)
  }

  // ── Magic link sent screen ──────────────────────────────
  if (magicSent) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-surface p-10">
            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-charcoal mb-3">Check your inbox</h2>
            <p className="text-base text-muted leading-relaxed mb-2">
              We sent a sign-in link to
            </p>
            <p className="text-base font-medium text-charcoal mb-8">{email}</p>
            <p className="text-sm text-muted">
              Didn&apos;t receive it?{' '}
              <button onClick={() => setMagicSent(false)} className="text-green hover:underline">
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Main login form ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 pt-6 pb-16">
      <div className="w-full max-w-md">

        {/* Logo */}
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

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface px-8 py-10">

          <h2 className="font-serif text-xl text-charcoal mb-8">
            Sign in to your account
          </h2>

          {resumeCheckout && (
            <div
              className="rounded-xl px-4 py-3 mb-6"
              style={{ backgroundColor: 'rgba(70,120,38,0.10)', border: '1px solid rgba(70,120,38,0.25)' }}
            >
              <p className="text-base leading-relaxed" style={{ color: '#3A6420' }}>
                Please sign in again to finish your payment. Nothing has been charged yet — you&apos;ll go straight back to checkout.
              </p>
            </div>
          )}

          <form onSubmit={handlePasswordLogin}>

            {/* Email */}
            <div className="mb-5">
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

            {/* Password */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-sm font-medium text-charcoal">
                  Password
                </label>
                <a href="/reset-password" className="inline-flex items-center min-h-[44px] text-sm text-muted hover:text-green transition-colors">
                  Forgot your password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-4 rounded-xl border border-surface bg-cream text-charcoal text-base placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-muted hover:text-charcoal transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div role="alert" className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mt-5">
                <p className="text-sm text-red-700 leading-relaxed whitespace-pre-line">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full mt-6"
            >
              {loading ? 'Please wait…' : 'Sign in'}
            </Button>
          </form>

          {/* Magic link alternative */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-surface" />
              <span className="text-xs text-muted">or</span>
              <div className="flex-1 h-px bg-surface" />
            </div>
            <button
              onClick={handleMagicLink}
              disabled={magicLoading}
              className="w-full min-h-[44px] rounded-full border border-charcoal/15 text-sm font-medium text-charcoal/65 hover:text-charcoal hover:border-charcoal/30 transition-all disabled:opacity-50"
            >
              {magicLoading ? 'Sending…' : 'Email me a sign-in link instead'}
            </button>
            <p className="text-sm text-muted text-center mt-3 leading-relaxed">
              We&apos;ll send a link to your email — no password needed.
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted">
            Not a member yet?{' '}
            <a
              href={searchParams.get('next') ? `/signup?next=${encodeURIComponent(next)}` : '/signup'}
              className="text-green hover:underline font-medium"
            >
              Create an account
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
