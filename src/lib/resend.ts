import { Resend } from 'resend';
import { lazyClient } from '@/lib/lazyClient';

// Constructed on first use so the production build doesn't require
// RESEND_API_KEY at build time (see lazyClient).
export const resend = lazyClient(() => new Resend(process.env.RESEND_API_KEY));

export const FROM_EMAIL = 'TAT for Animals <hello@tatforanimals.com>';
