import type { MetadataRoute } from 'next'

// Public, indexable pages only — members-only areas (dashboard, library,
// checkout) and auth utility pages are deliberately absent; robots.ts also
// disallows them. Registered with Google via Search Console at launch.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tatforanimals.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: '', priority: 1 },
    { path: '/membership', priority: 0.9 },
    { path: '/about', priority: 0.8 },
    { path: '/faq', priority: 0.6 },
    { path: '/contact', priority: 0.5 },
    { path: '/privacy', priority: 0.2 },
    { path: '/terms', priority: 0.2 },
    { path: '/disclaimer', priority: 0.2 },
  ]
  return pages.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'monthly',
    priority,
  }))
}
