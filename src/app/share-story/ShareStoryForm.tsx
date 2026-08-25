'use client'

import { useState, useRef } from 'react'

type Status = 'idle' | 'sending' | 'sent' | 'error'

// Kept in sync with the API route's cap — see the comment there on why 4MB
// (Vercel's serverless function body-size limit is 4.5MB).
const MAX_PHOTO_BYTES = 4 * 1024 * 1024

export default function ShareStoryForm() {
  const [animalName, setAnimalName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [story, setStory] = useState('')
  const [consent, setConsent] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (file && file.size > MAX_PHOTO_BYTES) {
      setError('That photo is too large — please use one under 4MB.')
      setPhoto(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setError('')
    setPhoto(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      const formData = new FormData()
      formData.set('animalName', animalName)
      formData.set('displayName', displayName)
      formData.set('story', story)
      formData.set('consent', String(consent))
      if (photo) formData.set('photo', photo)

      const res = await fetch('/api/share-story', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok && data.ok) {
        setStatus('sent')
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
        setStatus('error')
      }
    } catch {
      setError("We couldn't reach us just now. Please check your connection and try again.")
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div
        className="rounded-2xl px-6 py-8"
        style={{ backgroundColor: 'rgba(70,120,38,0.06)', border: '1px solid rgba(70,120,38,0.20)' }}
      >
        <p className="font-serif text-2xl mb-2" style={{ color: '#1C1007' }}>
          Thank you — your story is on its way.
        </p>
        <p className="text-base leading-relaxed" style={{ color: 'rgba(28,16,7,0.65)' }}>
          Tapas reads every story, and may reach out if she&rsquo;d like to share yours.
        </p>
      </div>
    )
  }

  const labelStyle = 'block text-base font-medium mb-2'
  const inputStyle =
    'w-full rounded-xl px-4 py-3 text-base bg-white min-h-[44px] transition-colors ' +
    'border border-[#E2D6C8] focus:outline-none focus:border-[#467826] focus:ring-2 focus:ring-[#467826]/30'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="animalName" className={labelStyle} style={{ color: '#1C1007' }}>
            Your animal&rsquo;s name <span className="font-normal" style={{ color: 'rgba(28,16,7,0.65)' }}>(optional)</span>
          </label>
          <input
            id="animalName"
            type="text"
            maxLength={100}
            value={animalName}
            onChange={(e) => setAnimalName(e.target.value)}
            className={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="displayName" className={labelStyle} style={{ color: '#1C1007' }}>
            Your name, as you&rsquo;d like it to appear <span className="font-normal" style={{ color: 'rgba(28,16,7,0.65)' }}>(optional)</span>
          </label>
          <input
            id="displayName"
            type="text"
            maxLength={100}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={inputStyle}
          />
        </div>
      </div>

      <div>
        <label htmlFor="story" className={labelStyle} style={{ color: '#1C1007' }}>
          Your story
        </label>
        <textarea
          id="story"
          required
          rows={8}
          maxLength={5000}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Share your story — how has TAT helped your animal, and you?"
          className={inputStyle + ' resize-y'}
        />
      </div>

      <div>
        <label htmlFor="photo" className={labelStyle} style={{ color: '#1C1007' }}>
          A photo of your animal <span className="font-normal" style={{ color: 'rgba(28,16,7,0.65)' }}>(optional)</span>
        </label>
        <input
          id="photo"
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={handlePhotoChange}
          className="block w-full text-base file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-base file:font-medium file:bg-[#467826]/10 file:text-[#467826] hover:file:bg-[#467826]/15"
        />
        <p className="text-sm leading-relaxed mt-1.5" style={{ color: 'rgba(28,16,7,0.65)' }}>
          You and your animal together, or just your animal — whatever you&rsquo;d like to share.
        </p>
      </div>

      {/* Checkbox itself stays visually small, but the label wraps it so the
          whole row is a 44px-tall tap target (WCAG target size). */}
      <label htmlFor="consent" className="flex items-start gap-3 min-h-[44px] py-1 cursor-pointer">
        <input
          id="consent"
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 w-5 h-5 rounded border-[#E2D6C8] text-[#467826] focus:outline-none focus:ring-2 focus:ring-[#467826]/30 shrink-0"
        />
        <span className="text-sm leading-relaxed" style={{ color: 'rgba(28,16,7,0.75)' }}>
          I grant TATLife the right to use my story, name, and any submitted photos for
          marketing, educational, and promotional purposes. I have read and agree to the
          TATLife Participant Release and License Agreement.
        </span>
      </label>

      {status === 'error' && (
        <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#FDECEC', border: '1px solid #F5C6C6' }}>
          <p className="text-sm leading-relaxed" style={{ color: '#B42318' }}>
            {error}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full sm:w-auto px-8 py-4 rounded-xl text-[19px] font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
        style={{ backgroundColor: '#D4703A', color: '#FAF6F1', boxShadow: '0 8px 24px rgba(212,112,58,0.20)' }}
      >
        {status === 'sending' ? 'Sending…' : 'Share your story'}
      </button>
    </form>
  )
}
