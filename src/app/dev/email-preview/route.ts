// DEV-ONLY email preview — review/edit the email templates in the browser without
// sending real mail. Visit /dev/email-preview to see all of them; edit any file in
// src/lib/emails/ and refresh (HMR). 404s in production so it can never ship live.
//
// One email full HTML:  /dev/email-preview?raw=welcome-circle
// Narrow (mobile) width: /dev/email-preview?raw=welcome-circle  (the email tables are
//                         responsive; resize the iframe via &w= on the index links)

import { welcomeEmail } from '@/lib/emails/welcome'
import { cancellationEmail } from '@/lib/emails/cancellation'
import { webinarInviteEmail } from '@/lib/emails/webinar-invite'
import { recordingNotificationEmail } from '@/lib/emails/recording-notification'
import { accountDeletionEmail } from '@/lib/emails/account-deletion'

type Preview = { label: string; subject: string; html: string }

function buildPreviews(): Record<string, Preview> {
  const wLibrary = welcomeEmail('Kai', 'subscriber')
  const wCircle = welcomeEmail('Marion Olsen', 'pro_subscriber')
  const cancel = cancellationEmail('Marion')
  const webinar = webinarInviteEmail('Marion', {
    title: 'Calming an anxious dog — live with Tapas',
    date: 'Thursday, June 12 at 11:00 AM PT',
    description: 'A gentle walkthrough of TAT for animals who startle easily, with time for your questions.',
    meetingUrl: 'https://example.com/meeting',
  })
  const recording = recordingNotificationEmail('Marion', {
    title: 'June live session — soothing separation anxiety',
    date: 'June 2026',
    summary: 'Tapas walks through a full session for an animal that struggles when left alone, plus a short grounding practice for you.',
    recordingUrl: 'https://example.com/recording',
  })
  const deletion = accountDeletionEmail('https://tatforanimals.com/api/confirm-account-deletion?token=preview')

  return {
    'welcome-library': { label: 'Welcome — The Calm Library', subject: wLibrary.subject, html: wLibrary.html },
    'welcome-circle': { label: 'Welcome — The Calm Circle', subject: wCircle.subject, html: wCircle.html },
    'cancellation': { label: 'Cancellation', subject: cancel.subject, html: cancel.html },
    'webinar-invite': { label: 'Webinar invite', subject: webinar.subject, html: webinar.html },
    'recording-notification': { label: 'Recording notification', subject: recording.subject, html: recording.html },
    'account-deletion': { label: 'Account deletion', subject: deletion.subject, html: deletion.html },
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function GET(request: Request): Promise<Response> {
  // Never expose in production.
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not found', { status: 404 })
  }

  const url = new URL(request.url)
  const previews = buildPreviews()
  const raw = url.searchParams.get('raw')

  // Single email — return its raw HTML so the iframe renders it exactly as the inbox would.
  if (raw) {
    const p = previews[raw]
    if (!p) return new Response('Unknown template', { status: 404 })
    return new Response(p.html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
  }

  // Index — every template stacked, at email + mobile widths.
  const widths = [600, 375]
  const cards = Object.entries(previews)
    .map(([key, p]) => {
      const frames = widths
        .map(
          (w) => `
        <div>
          <div class="w">${w}px</div>
          <iframe src="?raw=${key}" style="width:${w}px;height:760px;border:1px solid #e3d9d1;border-radius:8px;background:#fff;"></iframe>
        </div>`
        )
        .join('')
      return `
      <section class="card">
        <h2>${escapeHtml(p.label)}</h2>
        <p class="subj"><strong>Subject:</strong> ${escapeHtml(p.subject)}</p>
        <p class="file">src/lib/emails/${key.startsWith('welcome') ? 'welcome' : key}.ts</p>
        <div class="frames">${frames}</div>
      </section>`
    })
    .join('')

  const page = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><title>Email previews (dev)</title>
<style>
  body{font-family:system-ui,sans-serif;background:#f4efe9;color:#1C1007;margin:0;padding:32px;}
  .head{max-width:1100px;margin:0 auto 24px;}
  .head h1{margin:0 0 4px;font-size:24px;}
  .head p{margin:0;color:#8B6F5E;font-size:14px;}
  .card{max-width:1100px;margin:0 auto 40px;background:#fff;border:1px solid #e3d9d1;border-radius:14px;padding:24px;}
  .card h2{margin:0 0 6px;font-size:18px;}
  .subj{margin:0 0 2px;font-size:14px;color:#4b3a2c;}
  .file{margin:0 0 16px;font-size:12px;color:#8B6F5E;font-family:ui-monospace,monospace;}
  .frames{display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start;}
  .w{font-size:12px;color:#8B6F5E;margin-bottom:6px;}
</style></head>
<body>
  <div class="head">
    <h1>Email previews <span style="font-weight:400;color:#8B6F5E;">(dev only)</span></h1>
    <p>Edit any file in <code>src/lib/emails/</code> and refresh. Left = 600px (desktop), right = 375px (mobile). Not reachable in production.</p>
  </div>
  ${cards}
</body></html>`

  return new Response(page, { headers: { 'content-type': 'text/html; charset=utf-8' } })
}
