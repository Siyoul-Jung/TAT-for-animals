'use client';

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — must stay empty
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, website }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus('sent');
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setError("We couldn't reach us just now. Please check your connection and try again.");
      setStatus('error');
    }
  }

  // Confirmation replaces the form so it's unmistakable the message went through.
  if (status === 'sent') {
    return (
      <div
        className="rounded-2xl px-6 py-8"
        style={{ backgroundColor: 'rgba(70,120,38,0.06)', border: '1px solid rgba(70,120,38,0.20)' }}
      >
        <p className="font-serif text-2xl mb-2" style={{ color: '#1C1007' }}>
          Thank you — your message is on its way.
        </p>
        <p className="text-base leading-relaxed" style={{ color: 'rgba(28,16,7,0.65)' }}>
          We typically respond within 1–2 business days.
        </p>
      </div>
    );
  }

  const labelStyle = 'block text-base font-medium mb-2';
  const inputStyle =
    'w-full rounded-xl px-4 py-3 text-base bg-white min-h-[44px] transition-colors ' +
    'border border-[#E2D6C8] focus:outline-none focus:border-[#467826] focus:ring-2 focus:ring-[#467826]/30';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Honeypot — hidden from people, tempting to bots. Kept out of the tab order
          and announced to no one. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px]" style={{ height: 0, overflow: 'hidden' }}>
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name" className={labelStyle} style={{ color: '#1C1007' }}>
          Your name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputStyle}
          autoComplete="name"
        />
      </div>

      <div>
        <label htmlFor="email" className={labelStyle} style={{ color: '#1C1007' }}>
          Your email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputStyle}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="message" className={labelStyle} style={{ color: '#1C1007' }}>
          Your message
        </label>
        <textarea
          id="message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputStyle + ' resize-y'}
        />
      </div>

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
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
