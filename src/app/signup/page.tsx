import type { Metadata } from 'next'
import { Suspense } from 'react'
import SignupClient from './SignupClient'

export const metadata: Metadata = {
  title: 'Create Account | TAT for Animals®',
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <SignupClient />
    </Suspense>
  )
}
