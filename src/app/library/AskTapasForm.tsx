'use client'

import { useState } from 'react'

// "Ask Tapas your question for an upcoming live webinar" (Tapas, 2026-07-14).
// Circle members are signed in, so the form is a single textarea — name and
// email travel with the account, nothing to retype. Success swaps the form for
// a confirmation box (one clear state at a time) with a way to ask another.
export default function AskTapasForm() {
  const [question, setQuestion] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setStatus('sending')
    try {
      const res = await fetch('/api/webinar-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      if (res.ok) {
        setStatus('sent')
        setQuestion('')
        return
      }
      const data = await res.json().catch(() => null)
      setError(data?.error ?? "We couldn't send your question just now. Please try again in a moment.")
      setStatus('idle')
    } catch {
      setError("We couldn't send your question just now. Please check your connection and try again.")
      setStatus('idle')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-green">
        Ask Tapas
      </h2>

      {status === 'sent' ? (
        <div
          role="status"
          className="rounded-xl p-5 space-y-3"
          style={{ backgroundColor: '#EBF5E1', border: '1px solid rgba(70,120,38,0.25)' }}
        >
          <p className="text-base text-charcoal leading-relaxed">
            Your question is on its way to Tapas. She may answer it in an upcoming live webinar.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="inline-flex items-center min-h-[44px] text-base font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity"
            style={{ color: '#467826' }}
          >
            Ask another question
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="ask-tapas-question" className="block text-base text-charcoal/80 leading-relaxed">
              Ask Tapas your question for an upcoming live webinar.
            </label>
            {/* Set expectations up front (Tapas, 2026-07-16): don't imply every
                question gets answered. */}
            <p className="text-sm text-charcoal/65 leading-relaxed italic">
              She reads every question and answers as many as she can — she may not be able to get to them all.
            </p>
          </div>
          <textarea
            id="ask-tapas-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            maxLength={3000}
            rows={4}
            placeholder="Write your question here…"
            className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-base text-charcoal leading-relaxed placeholder:text-charcoal/60 focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent resize-y"
          />

          {error && (
            <div
              role="alert"
              className="rounded-xl p-4 text-base leading-relaxed text-red-700"
              style={{ backgroundColor: '#FEF2F2', border: '1px solid rgba(185,28,28,0.25)' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="inline-flex items-center justify-center min-h-[52px] px-7 rounded-xl text-[19px] font-bold text-cream transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: '#D4703A', boxShadow: '0 8px 24px rgba(212,112,58,0.20)' }}
          >
            {status === 'sending' ? 'Sending your question…' : 'Send your question'}
          </button>
        </form>
      )}
    </div>
  )
}
