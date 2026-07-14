import type { MetadataRoute } from 'next'

// Crawler rules for the PUBLIC site. Note: until launch, layout.tsx also sets
// a page-level `robots: { index: false }` that keeps everything out of Google
// regardless of this file — removing that line is a launch-checklist step.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tatforanimals.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Members-only, transactional, and auth-utility pages — nothing a search
      // visitor should land on.
      disallow: [
        '/api/',
        '/dashboard',
        '/library',
        '/checkout',
        '/thank-you',
        '/studio',
        '/confirm-account-deletion',
        '/reset-password',
        '/update-password',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
