'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

export default function UpdatePasswordClient() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleUpdate(e: React.FormEvent) {
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

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Something went wrong. The link may have expired — please request a new one.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const eyeIcon = (
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
  )

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.2em] text-muted uppercase mb-2">
            Tapas Acupressure Technique
          </p>
          <h1 className="font-serif text-3xl text-charcoal">TAT® Calm</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-surface px-8 py-10">
          <h2 className="font-serif text-xl text-charcoal mb-2">Create a new password</h2>
          <p className="text-sm text-muted mb-8">
            Choose something you'll remember easily.
          </p>

          <form onSubmit={handleUpdate}>

            {/* 새 비밀번호 */}
            <div className="mb-5">
              <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-2">
                New password
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
                {eyeIcon}
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal mb-2">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-4 rounded-xl border border-surface bg-cream text-charcoal text-base placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all pr-12"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
                <p className="text-sm text-red-600 leading-relaxed">{error}</p>
                {error.includes('expired') && (
                  <a href="/reset-password" className="text-sm text-brand hover:underline mt-1 block">
                    Request a new reset link →
                  </a>
                )}
              </div>
            )}

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? 'Saving…' : 'Save new password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
