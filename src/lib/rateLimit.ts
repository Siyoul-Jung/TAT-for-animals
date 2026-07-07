import { supabaseAdmin } from '@/lib/supabase/admin'

// Fixed-window rate limit shared across serverless instances (backed by the
// public.check_rate_limit Postgres function). Returns true if the call is
// ALLOWED, false if it should be blocked.
//
// Fails OPEN: if the limiter itself errors (DB blip), we allow the request
// rather than lock out a legitimate user — availability over strict enforcement,
// the standard choice for rate limiting.
export async function checkRateLimit(
  scope: string,
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      p_key: `${scope}:${identifier}`,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    })
    if (error) {
      console.error('Rate limit check failed (allowing):', error)
      return true
    }
    return data === true
  } catch (e) {
    console.error('Rate limit check threw (allowing):', e)
    return true
  }
}

// Best-effort client IP for unauthenticated routes. On Vercel the real client is
// the first entry of x-forwarded-for.
export function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

// Standard 429 body for a blocked request.
export const RATE_LIMIT_MESSAGE =
  'Too many requests. Please wait a little while and try again.'
