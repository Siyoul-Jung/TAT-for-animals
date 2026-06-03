import { createBrowserClient } from '@supabase/ssr'
import { lazyClient } from '@/lib/lazyClient'

export function createClient() {
  // Lazy so build-time prerendering of pages that call createClient() doesn't
  // require the public Supabase env vars at build time (see lazyClient).
  return lazyClient(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )
}
