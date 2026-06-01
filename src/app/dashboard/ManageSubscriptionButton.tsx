'use client'

import { useState } from 'react'

export default function ManageSubscriptionButton({ label = 'Manage Subscription' }: { label?: string }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Unable to load subscription. Please try again.')
        setIsLoading(false)
      }
    } catch {
      alert('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="min-h-[44px] px-6 py-3 rounded-full border border-charcoal/20 text-charcoal/70 text-base font-medium hover:border-brand hover:text-brand transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Connecting...' : label}
    </button>
  )
}
