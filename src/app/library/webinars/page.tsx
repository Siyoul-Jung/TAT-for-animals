import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Webinars | TAT for Animals',
}

export default function WebinarsPage() {
  redirect('/library?tab=live')
}
