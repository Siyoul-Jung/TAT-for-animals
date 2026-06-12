'use client'

import { useState } from 'react'

export default function ManageSubscriptionButton({ label = 'Manage Subscription' }: { label?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError("We couldn't open your subscription settings just now. Please try again in a moment.")
        setIsLoading(false)
      }
    } catch {
      setError('Something went wrong on our end. Please check your connection and try again.')
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="min-h-[44px] px-6 py-3 rounded-full border border-charcoal/20 text-charcoal/65 text-base font-medium hover:border-brand hover:text-green transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Connecting...' : label}
      </button>
      {error && (
        <p role="alert" className="mt-3 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
