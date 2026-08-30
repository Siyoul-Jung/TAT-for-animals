import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import WelcomeBackGate from './WelcomeBackGate'
import WelcomeBackOffer from './WelcomeBackOffer'

export const metadata: Metadata = {
  title: 'Welcome back | TAT for Animals',
  robots: { index: false, follow: false },
}

export default async function WelcomeBackPage() {
  const cookieStore = await cookies()
  const unlocked = cookieStore.get('welcome_back_unlocked')?.value === '1'

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-20">
      {unlocked ? <WelcomeBackOffer /> : <WelcomeBackGate />}
    </main>
  )
}
