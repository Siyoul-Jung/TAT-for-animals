import type { Metadata } from 'next'
import ResetPasswordClient from './ResetPasswordClient'

export const metadata: Metadata = {
  title: 'Reset Password | TAT® for Animals',
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}
