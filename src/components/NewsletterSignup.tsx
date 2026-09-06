'use client'

import { useState } from 'react'
import Image from 'next/image'

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
      {/* Lead-in — Tapas's photo slot (Jez, 2026-07-31): the funny card photo
          Tapas approved (2026-08-03: "the very funny pic of me with the card"). */}
      <div className="flex items-center gap-5 max-w-2xl">
        {/* Drawn at 80 CSS px, so a 3x screen wants 240. Declared at 240 the
            source (1600px) has plenty to give — Tapas found this one soft too. */}
        <Image
          src="/images/tapas-newsletter-photo.jpg"
          alt="Tapas Fleming"
          width={160}
          height={160}
          quality={90}
          className="w-20 h-20 rounded-full object-cover shrink-0"
        />
        <div>
          {/* 40px/22px는 Jez가 지정한 데스크톱 기준값 — 좁은 화면 그대로 적용하면
              헤딩만으로 화면 절반을 차지해 Footer의 조용한 존재감이 깨짐
              (2026-07-31 라이브 확인). 모바일은 비율 맞춰 축소, sm: 이상에서
              지정값 그대로. line-height: 2.5em은 Jez 지정값(2026-08-03) — em
              단위라 폰트 크기 비율대로 커져 모바일에서도 그대로 안전. */}
          <p className="font-serif text-[26px] sm:text-[40px] leading-[2.5em] text-charcoal">Stay close to the stories.</p>
          {/* Much larger than before (Tapas, 2026-08-24: "not as big as the
              'Stay close' header") — sized proportionately with the header bump above. */}
          <p className="text-xl sm:text-[30px] font-light leading-relaxed mt-1" style={{ color: 'rgba(28,16,7,0.85)' }}>
            Uplifting animal stories and the occasional special offer, straight to your inbox.
          </p>
        </div>
      </div>

      {/* Form / confirmation */}
      <div className="w-full lg:w-auto">
        {status === 'success' ? (
          <p
            role="status"
            className="flex items-center gap-2 text-sm font-medium py-3"
            style={{ color: 'rgba(28,16,7,0.85)' }}
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
                className="h-12 px-4 rounded-lg w-full sm:w-72 text-base text-charcoal bg-cream placeholder:text-charcoal/60 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ ['--tw-ring-color' as string]: '#1C1007', ['--tw-ring-offset-color' as string]: '#7CC878' }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="h-12 px-6 rounded-lg text-[19px] font-bold text-cream transition-opacity hover:opacity-90 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap"
                style={{ backgroundColor: '#D4703A', border: '1px solid rgba(28,16,7,0.75)', ['--tw-ring-color' as string]: '#1C1007', ['--tw-ring-offset-color' as string]: '#7CC878' }}
              >
                {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>

            {status === 'error' && (
              <p role="alert" className="text-sm mt-2 leading-relaxed" style={{ color: 'rgba(28,16,7,0.85)' }}>
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
