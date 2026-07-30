// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * First name from a stored full name, cased as "Jez" regardless of how it was
 * typed in ("JEZ", "jez", "Jez Smith") — profiles.full_name is user-entered at
 * checkout with no case normalization, so an all-caps name reads shouty in a
 * greeting (Jez's report, 2026-07-30).
 */
export function displayFirstName(fullName: string | null | undefined): string | null {
  const first = fullName?.trim().split(/\s+/)[0];
  if (!first) return null;
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

/**
 * Sanitize a post-auth `next` redirect target so it can only point inside this
 * site. Prevents open-redirect phishing: an attacker can't craft
 * `?next=https://evil.com` (or protocol-relative `//evil.com`, `/\evil.com`) to
 * bounce a freshly-authenticated user off-site. Only same-origin absolute paths
 * (a single leading slash) are allowed; anything else falls back.
 */
export function safeNextPath(
  next: string | null | undefined,
  fallback = '/dashboard'
): string {
  if (!next || !next.startsWith('/')) return fallback;
  if (next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}
