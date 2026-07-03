import { emailShell, emailButton, escapeHtml, firstNameOf } from './layout';

type RecordingNotificationData = {
  title: string;
  date: string;        // e.g. "May 2026"
  summary: string | null;
  recordingUrl: string;
};

export function recordingNotificationEmail(
  name: string | null,
  recording: RecordingNotificationData
): { subject: string; html: string } {
  const firstName = firstNameOf(name);
  // Jez's confirmed wording + emoji (2026-07-02): the gentler option over the
  // original "[Streaming Access] Recap" phrasing she'd first proposed.
  // The subject is plain text — no escaping (a title like "Q&A" must not
  // render as "Q&amp;A" in the inbox); the HTML body below does escape.
  const subject = `🎥 A new recording is ready to watch — ${recording.title}`;
  const safeTitle = escapeHtml(recording.title);

  const content = `
              <h1 class="email-h1" style="margin:0 0 16px;font-family:'Georgia',serif;font-size:28px;font-weight:500;color:#1C1007;line-height:1.3;">
                ${safeTitle}
              </h1>
              <p style="margin:0 0 8px;font-size:17px;color:#1C1007;line-height:1.7;">
                Dear ${escapeHtml(firstName)},
              </p>
              <p style="margin:0 0 8px;font-size:17px;color:rgba(28,16,7,0.65);line-height:1.7;">
                The recording of ${safeTitle} is now available for replay! Happy watching!
              </p>
              <p style="margin:0;font-size:17px;color:rgba(28,16,7,0.65);line-height:1.7;">
                Feel free to share your feedback and experience with us.
              </p>

              ${recording.summary ? `
              <!-- Summary -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td style="padding-top:28px;border-top:1px solid rgba(28,16,7,0.08);text-align:center;">
                    <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#467826;font-weight:600;">
                      In this webinar
                    </p>
                    <p style="margin:0;font-size:15px;color:rgba(28,16,7,0.65);line-height:1.7;">
                      ${escapeHtml(recording.summary ?? '')}
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}
              ${emailButton(recording.recordingUrl, 'Watch the recording &rarr;')}`;

  const html = emailShell({
    title: subject,
    eyebrow: 'New Recording',
    content,
    footerNote: "You're receiving this as a member of The Calm Circle.",
  });

  return { subject, html };
}
