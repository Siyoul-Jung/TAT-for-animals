'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

type Mode = 'password' | 'magic'

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'

  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicSent, setMagicSent] = useState(false)

  const supabase = createClient()

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("That email and password combination doesn't match our records. Please try again, or use a sign-in link below.")
      setLoading(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    })

    if (error) {
      setError('Something went wrong. Please check your email address and try again.')
      setLoading(false)
      return
    }

    setMagicSent(true)
    setLoading(false)
  }

  function switchToMagic() {
    setMode('magic')
    setError(null)
    setPassword('')
  }

  function switchToPassword() {
    setMode('password')
    setError(null)
    setMagicSent(false)
  }

  // ── Magic Link 발송 완료 화면 ──────────────────────────────
  if (mode === 'magic' && magicSent) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-surface p-10">
            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-charcoal mb-3">Check your inbox</h2>
            <p className="text-base text-muted leading-relaxed mb-2">
              We sent a sign-in link to
            </p>
            <p className="text-base font-medium text-charcoal mb-6">{email}</p>
            <ol className="text-sm text-muted text-left space-y-2 bg-surface rounded-xl px-6 py-4 mb-8">
              <li className="flex gap-3"><span className="text-brand font-semibold">1.</span> Open your email app</li>
              <li className="flex gap-3"><span className="text-brand font-semibold">2.</span> Find the email from TAT® Calm</li>
              <li className="flex gap-3"><span className="text-brand font-semibold">3.</span> Click the "Sign in" link inside</li>
            </ol>
            <p className="text-xs text-muted">
              Didn't receive it?{' '}
              <button onClick={() => setMagicSent(false)} className="text-brand hover:underline">
                Try again
              </button>
              {' '}or{' '}
              <button onClick={switchToPassword} className="text-brand hover:underline">
                use a password instead
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── 메인 로그인 폼 ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* 로고 */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.2em] text-muted uppercase mb-2">
            Tapas Acupressure Technique
          </p>
          <h1 className="font-serif text-3xl text-charcoal">TAT® Calm</h1>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface px-8 py-10">

          <h2 className="font-serif text-xl text-charcoal mb-8">
            {mode === 'password' ? 'Welcome back' : 'Sign in without a password'}
          </h2>

          <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink}>

            {/* 이메일 */}
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

            {/* 비밀번호 (password 모드만) */}
            {mode === 'password' && (
              <div className="mb-2">
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
                    autoComplete="current-password"
                    placeholder="••••••••"
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
            )}

            {/* Magic Link 안내문 */}
            {mode === 'magic' && (
              <p className="text-sm text-muted mb-6 leading-relaxed">
                We'll email you a secure link. Click it to sign in instantly — no password needed.
              </p>
            )}

            {/* 에러 */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
                <p className="text-sm text-red-600 leading-relaxed">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full mt-6"
            >
              {loading
                ? 'Please wait…'
                : mode === 'password'
                ? 'Sign in'
                : 'Send me a sign-in link'}
            </Button>
          </form>

          {/* 모드 전환 */}
          <div className="mt-6 pt-6 border-t border-surface text-center">
            {mode === 'password' ? (
              <p className="text-sm text-muted">
                Forgot your password?{' '}
                <button onClick={switchToMagic} className="text-brand hover:underline font-medium">
                  Sign in without one
                </button>
              </p>
            ) : (
              <p className="text-sm text-muted">
                Remember your password?{' '}
                <button onClick={switchToPassword} className="text-brand hover:underline font-medium">
                  Sign in with password
                </button>
              </p>
            )}
          </div>
        </div>

        {/* 하단 */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-muted">
            Forgot your password?{' '}
            <a href="/reset-password" className="text-brand hover:underline font-medium">
              Reset it
            </a>
          </p>
          <p className="text-sm text-muted">
            Not a member yet?{' '}
            <a href="/signup" className="text-brand hover:underline font-medium">
              Create an account
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
