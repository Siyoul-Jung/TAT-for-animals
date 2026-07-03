'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

// The account-deletion confirm link redirects to the homepage with a result param
// (?deleted=true or ?error=...). Without this, the user lands on the marketing page
// with no idea whether their account was deleted. This surfaces a calm, dismissible
// notice so every outcome gets closure.
const MESSAGES: Record<string, { tone: 'success' | 'error'; text: string }> = {
  'deleted:true': {
    tone: 'success',
    text: 'Your account has been deleted. Thank you for being with us — you’re always welcome back.',
  },
  'error:invalid-link': {
    tone: 'error',
    text: 'That account-deletion link isn’t valid. If you still want to delete your account, request a new link from your dashboard.',
  },
  'error:already-processed': {
    tone: 'error',
    text: 'That account-deletion link has already been used.',
  },
  'error:link-expired': {
    tone: 'error',
    text: 'That account-deletion link has expired. Please request a new one from your dashboard.',
  },
  'error:cancel-subscription-first': {
    tone: 'error',
    text: 'We couldn’t delete your account because you still have an active membership. If you haven’t already, cancel it from your dashboard — once your paid period ends, you can request deletion again.',
  },
  'error:deletion-failed': {
    tone: 'error',
    text: 'Something went wrong deleting your account. Please try again, or email hello@tatforanimals.com.',
  },
};

export default function AccountNotice() {
  const params = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const key = params.get('deleted')
    ? `deleted:${params.get('deleted')}`
    : params.get('error')
      ? `error:${params.get('error')}`
      : null;
  const msg = key ? MESSAGES[key] : null;

  if (!msg || dismissed) return null;
  const isSuccess = msg.tone === 'success';

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
      <div
        role="status"
        className="rounded-2xl border bg-white shadow-lg flex items-start gap-3 px-5 py-4"
        style={{ borderColor: isSuccess ? 'rgba(70,120,38,0.35)' : 'rgba(220,38,38,0.30)' }}
      >
        <span
          className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: isSuccess ? 'rgba(70,120,38,0.12)' : 'rgba(220,38,38,0.10)' }}
        >
          {isSuccess ? (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#467826" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M12 3l9 16H3l9-16z" />
            </svg>
          )}
        </span>
        <p className="text-sm text-charcoal/85 leading-relaxed flex-1">{msg.text}</p>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 -mr-1 -mt-1 w-11 h-11 flex items-center justify-center text-charcoal/60 hover:text-charcoal/80 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
