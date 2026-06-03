import Stripe from 'stripe'
import { lazyClient } from '@/lib/lazyClient'

// Constructed on first use so the production build doesn't require
// STRIPE_SECRET_KEY at build time (see lazyClient).
export const stripe = lazyClient(
  () =>
    new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
      typescript: true,
    })
)
