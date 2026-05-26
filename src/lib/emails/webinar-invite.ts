type WebinarInviteData = {
  title: string;
  date: string;       // e.g. "Thursday, June 5 at 11:00 AM PT"
  description: string | null;
  meetingUrl: string;
};

export function webinarInviteEmail(
  name: string | null,
  webinar: WebinarInviteData
): { subject: string; html: string } {
  const firstName = name?.split(' ')[0] ?? 'there';
  const subject = `Upcoming live session with Tapas — ${webinar.title}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#FBF5F3;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF5F3;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:40px;">
              <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#5E9635;font-weight:600;">
                TAT for Animals — Live Session
              </p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding-bottom:32px;border-bottom:1px solid rgba(28,16,7,0.08);">
              <h1 style="margin:0 0 16px;font-size:32px;font-weight:500;color:#1C1007;line-height:1.3;">
                ${webinar.title}
              </h1>
              <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:17px;color:rgba(28,16,7,0.6);line-height:1.7;font-weight:300;">
                Hi ${firstName}, your next live session with Tapas is coming up.
              </p>
            </td>
          </tr>

          <!-- Date + Description -->
          <tr>
            <td style="padding:32px 0;border-bottom:1px solid rgba(28,16,7,0.08);">
              <p style="margin:0 0 6px;font-family:'Helvetica Neue',sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(212,112,58,0.7);font-weight:500;">
                When
              </p>
              <p style="margin:0 0 24px;font-family:'Helvetica Neue',sans-serif;font-size:17px;color:#1C1007;font-weight:500;">
                ${webinar.date}
              </p>
              ${webinar.description ? `
              <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:15px;color:rgba(28,16,7,0.6);line-height:1.7;font-weight:300;">
                ${webinar.description}
              </p>
              ` : ''}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:32px 0;border-bottom:1px solid rgba(28,16,7,0.08);">
              <a href="${webinar.meetingUrl}"
                style="display:inline-block;padding:14px 32px;background:#D4703A;color:#FBF5F3;font-family:'Helvetica Neue',sans-serif;font-size:15px;font-weight:600;text-decoration:none;border-radius:100px;">
                Join the session →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;">
              <p style="margin:0 0 8px;font-family:'Helvetica Neue',sans-serif;font-size:12px;color:rgba(28,16,7,0.35);line-height:1.6;">
                You're receiving this because you're a member of The Calm Circle.
              </p>
              <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:12px;color:rgba(28,16,7,0.25);">
                © 2026 TATLife®, Inc. · tatforanimals.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html };
}
