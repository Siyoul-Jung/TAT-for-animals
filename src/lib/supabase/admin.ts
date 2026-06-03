import { createClient } from '@supabase/supabase-js'
import { lazyClient } from '@/lib/lazyClient'

// Service-role client for server-side code that must bypass RLS (webhooks,
// account deletion, email sends). Constructed on first use so the production
// build doesn't require the service-role env vars at build time.
export const supabaseAdmin = lazyClient(() =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
)
