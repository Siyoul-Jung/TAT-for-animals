import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { membershipHasLapsed } from '@/lib/access'
import type { Metadata } from 'next'
import ShareStoryForm from './ShareStoryForm'

export const metadata: Metadata = {
  title: 'Share Your Story | TAT for Animals',
}

// Subscriber-only (both tiers) — Tapas asked (2026-08-14) for this to be open
// to "subscribers from both tiers", so a guest or lapsed member is sent to
// join rather than seeing a form they can't submit. Middleware already
// guarantees a signed-in user reaches this point.
export default async function ShareStoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/share-story')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, cancel_at')
    .eq('id', user.id)
    .single()
  const role = membershipHasLapsed(profile?.cancel_at) ? 'guest' : (profile?.role ?? 'guest')
  if (role !== 'subscriber' && role !== 'pro_subscriber') redirect('/membership')

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-4" style={{ color: '#467826' }}>
            Share your story
          </p>
          <h1 className="font-serif text-3xl text-charcoal font-medium leading-tight">
            How has TAT helped your animal, and you?
          </h1>
          <p className="text-base text-charcoal/65 leading-relaxed mt-4">
            We&rsquo;d love to hear it, and with your okay, share it to encourage others.
          </p>
        </div>
        <ShareStoryForm />
      </div>
    </main>
  )
}
