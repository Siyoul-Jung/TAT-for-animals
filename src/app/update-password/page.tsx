import type { Metadata } from 'next'
import UpdatePasswordClient from './UpdatePasswordClient'

export const metadata: Metadata = {
  title: 'Set New Password | TAT® for Animals',
}

export default function UpdatePasswordPage() {
  return <UpdatePasswordClient />
}
