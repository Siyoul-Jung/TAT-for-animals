import type { Metadata } from 'next'
import SignupClient from './SignupClient'

export const metadata: Metadata = {
  title: 'Create Account | TAT® Calm',
}

export default function SignupPage() {
  return <SignupClient />
}
