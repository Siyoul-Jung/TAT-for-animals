// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
