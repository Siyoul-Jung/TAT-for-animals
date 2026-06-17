'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { safeNextPath } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function SignupClient() {
  const searchParams = useSearchParams()
  const next = safeNextPath(searchParams.get('next'), '/membership')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const supabase = createClient()

  // Re-send the confirmation email from the success screen, so a missing first
  // email is never a dead end (mirrors the login magic-link "Try again" flow).
  async function handleResend() {
    setResending(true)
    await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    setResent(true)
    setResending(false)
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("The passwords you entered don't match. Please try again.")
      return
    }

    if (password.length < 8) {
      setError('Your password must be at least 8 characters long.')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('An account with this email already exists. Try signing in instead.')
      } else {
        setError('Something went wrong. Please try again.')
      }
      setLoading(false)
      return
    }

    // With email-enumeration protection on, signing up with an email that already
    // exists returns success with NO error and NO email sent — Supabase only signals
    // it via an empty `identities` array. Detect that so we don't show a "check your
    // inbox" screen for a confirmation email that will never arrive.
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      setError('An account with this email already exists. Try signing in, or reset your password if you’ve forgotten it.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 pt-6 pb-16">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-surface p-10">
            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-charcoal mb-3">You&apos;re almost in</h2>
            <p className="text-base text-muted leading-relaxed mb-2">
              We sent a confirmation link to
            </p>
            <p className="text-base font-medium text-charcoal mb-6">{email}</p>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Open that email and click the link to finish.
              Can&apos;t find it? Please check your spam or junk folder.
            </p>

            {resent ? (
              <p className="text-sm text-green leading-relaxed mb-6">
                Done — we&apos;ve sent it again. Give it a minute to arrive.
              </p>
            ) : (
              <p className="text-sm text-muted mb-6">
                Still nothing?{' '}
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-green hover:underline font-medium disabled:opacity-50"
                >
                  {resending ? 'Sending…' : 'Send the email again'}
                </button>
              </p>
            )}

            <p className="text-sm text-muted border-t border-surface pt-6">
              Already confirmed?{' '}
              <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-green hover:underline">
                Sign in to continue
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

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
            TAT for Animals<span className="text-green text-[11px] align-super">®</span>
          </span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface px-8 py-10">
          <h2 className="font-serif text-xl text-charcoal mb-2">Create your account</h2>
          <p className="text-sm text-muted mb-8">
            Already have an account?{' '}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-green hover:underline font-medium">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSignup}>

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
            <div className="mb-5">
              <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-4 rounded-xl border border-surface bg-cream text-charcoal text-base placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal transition-colors"
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

            {/* Confirm password */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal mb-2">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Re-enter your password"
                className="w-full px-4 py-4 rounded-xl border border-surface bg-cream text-charcoal text-base placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
                <p className="text-sm text-red-600 leading-relaxed">{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? 'Creating your account…' : 'Create account'}
            </Button>

            <p className="text-xs text-muted text-center mt-4 leading-relaxed">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-green hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-green hover:underline">Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
