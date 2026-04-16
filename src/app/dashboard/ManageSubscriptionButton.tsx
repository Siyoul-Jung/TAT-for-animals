'use client'

import { useState } from 'react'

export default function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('구독 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.')
        setIsLoading(false)
      }
    } catch {
      alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="min-h-[44px] px-6 py-3 rounded-full border border-charcoal/20 text-charcoal/70 text-base font-medium hover:border-brand hover:text-brand transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? '연결 중...' : 'Manage Subscription'}
    </button>
  )
}
