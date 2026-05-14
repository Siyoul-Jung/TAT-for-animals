import type { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About Tapas Fleming | TAT for Animals',
  description: 'Learn about Tapas Fleming, creator and founder of TAT® — the healing technique behind TAT for Animals.',
}

export default function AboutPage() {
  return <AboutClient />
}
