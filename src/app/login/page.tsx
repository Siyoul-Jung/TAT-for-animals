import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginClient from './LoginClient'

export const metadata: Metadata = {
  title: 'Sign In | TAT® Calm',
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <LoginClient />
    </Suspense>
  )
}
