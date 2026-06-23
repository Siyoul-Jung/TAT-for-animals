import { emailShell, emailButton } from './layout';

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
  const firstName = name?.split(' ')[0] ?? 'there';
  const subject = `New recording available — ${recording.title}`;

  const content = `
              <h1 class="email-h1" style="margin:0 0 16px;font-family:'Georgia',serif;font-size:28px;font-weight:500;color:#1C1007;line-height:1.3;">
                ${recording.title}
              </h1>
              <p style="margin:0;font-size:17px;color:rgba(28,16,7,0.65);line-height:1.7;">
                Hi ${firstName}, the recording from your ${recording.date} live webinar with Tapas is now ready to watch.
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
                      ${recording.summary}
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
