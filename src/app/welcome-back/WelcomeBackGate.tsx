'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WelcomeBackGate() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/welcome-back/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        router.refresh()
      } else {
        setError(data.error || "That password doesn't match — please try again.")
      }
    } catch {
      setError("We couldn't check that just now. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <p className="text-[13px] tracking-[0.2em] uppercase font-medium mb-3 text-center" style={{ color: '#38601E' }}>
        Welcome back
      </p>
      <h1 className="font-serif text-3xl text-charcoal font-medium mb-4 text-center">
        This page is private.
      </h1>
      <p className="text-charcoal/65 leading-relaxed mb-8 text-center">
        Please enter the password from your invite email.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full min-h-[52px] rounded-xl border border-charcoal/15 px-4 text-base text-charcoal focus:outline-none focus:border-green"
        />
        {error && (
          <div role="alert" className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-sm text-red-700 leading-relaxed">{error}</p>
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full min-h-[52px] rounded-xl font-bold text-[19px] transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#D4703A', color: '#FAF6F1', boxShadow: '0 8px 24px rgba(212,112,58,0.20)' }}
        >
          {loading ? 'Checking…' : 'Continue'}
        </button>
      </form>
    </div>
  )
}
