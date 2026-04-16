import type { Metadata } from 'next'
import UpdatePasswordClient from './UpdatePasswordClient'

export const metadata: Metadata = {
  title: 'Set New Password | TAT® Calm',
}

export default function UpdatePasswordPage() {
  return <UpdatePasswordClient />
}
