'use client'

import { useState } from 'react'

// Mailchimp embedded-form endpoint (Jez, 2026-06-26). Posting our own on-brand form
// straight to list-manage needs no API key. We use the post-json variant + JSONP so
// we can stay on the page and show inline feedback (the classic embed would open a
// new tab to Mailchimp's confirmation page). Audience "TAT for Animals" (us3).
// The b_… field is Mailchimp's honeypot: it must be submitted EMPTY — bots that fill
// a hidden field get rejected.
const MC_ENDPOINT =
  'https://tatlife.us3.list-manage.com/subscribe/post-json?u=62640a3e30f61ac8a9bad3b78&id=ba587b1881&f_id=0017cde3f0'
const MC_HONEYPOT = 'b_62640a3e30f61ac8a9bad3b78_ba587b1881'

// Minimal JSONP. Mailchimp blocks cross-origin fetch, so instead of reading a normal
// response we load it as a <script> that calls a one-off global callback. Browser-only,
// runs on submit. (This post-json + &c= technique is undocumented by Mailchimp but has
// been stable for years; if it ever breaks, the fallback is a native form POST.)
function mailchimpJsonp(url: string): Promise<{ result: string; msg: string }> {
  return new Promise((resolve, reject) => {
    const cb = `__mcjsonp_${Math.random().toString(36).slice(2)}`
    const script = document.createElement('script')
    const cleanup = () => {
      delete (window as unknown as Record<string, unknown>)[cb]
      script.remove()
    }
    ;(window as unknown as Record<string, unknown>)[cb] = (data: { result: string; msg: string }) => {
      cleanup()
      resolve(data)
    }
    script.onerror = () => {
      cleanup()
      reject(new Error('network'))
    }
    script.src = `${url}&c=${cb}`
    document.body.appendChild(script)
  })
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    setMessage('')
    try {
      const url = `${MC_ENDPOINT}&EMAIL=${encodeURIComponent(email)}&${MC_HONEYPOT}=`
      const data = await mailchimpJsonp(url)
      if (data.result === 'success') {
        setStatus('success')
        setMessage('Thank you for subscribing. Please check your inbox.')
      } else {
        // Mailchimp errors arrive as "N - message"; drop the leading code.
        const msg = (data.msg || '').replace(/^\d+\s*-\s*/, '')
        if (/already subscribed/i.test(msg)) {
          // Not really an error from the visitor's point of view.
          setStatus('success')
          setMessage('You are already on the list — thank you.')
        } else {
          setStatus('error')
          setMessage(msg || 'Something went wrong. Please try again.')
        }
      }
    } catch {
      setStatus('error')
      setMessage('We could not reach the server. Please try again in a moment.')
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
      {/* Lead-in */}
      <div className="max-w-md">
        <p className="font-serif text-lg text-cream/90">Stay close to the stories.</p>
        <p className="text-sm font-light leading-relaxed mt-1" style={{ color: 'rgba(250,246,241,0.65)' }}>
          Uplifting animal stories and the occasional special offer, straight to your inbox.
        </p>
      </div>

      {/* Form / confirmation */}
      <div className="w-full lg:w-auto">
        {status === 'success' ? (
          <p
            role="status"
            className="flex items-center gap-2 text-sm font-medium py-3"
            style={{ color: '#D4A843' }}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {message}
          </p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="h-12 px-4 rounded-lg w-full sm:w-72 text-base text-charcoal bg-cream placeholder:text-charcoal/45 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ ['--tw-ring-color' as string]: '#D4A843', ['--tw-ring-offset-color' as string]: '#1E3310' }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="h-12 px-6 rounded-lg text-base font-bold text-cream transition-opacity hover:opacity-90 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap"
                style={{ backgroundColor: '#D4703A', ['--tw-ring-color' as string]: '#D4A843', ['--tw-ring-offset-color' as string]: '#1E3310' }}
              >
                {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>

            {status === 'error' && (
              <p role="alert" className="text-sm mt-2 leading-relaxed" style={{ color: '#F0B58A' }}>
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
