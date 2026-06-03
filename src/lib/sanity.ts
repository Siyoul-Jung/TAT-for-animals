import { createClient } from '@sanity/client'
import { lazyClient } from '@/lib/lazyClient'

// Constructed on first use so the production build doesn't require
// NEXT_PUBLIC_SANITY_PROJECT_ID at build time (see lazyClient).
export const sanityClient = lazyClient(() =>
  createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
  })
)
