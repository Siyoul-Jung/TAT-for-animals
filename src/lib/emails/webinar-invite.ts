import { emailShell, emailButton, escapeHtml } from './layout';

type WebinarInviteData = {
  title: string;
  date: string;       // ISO datetime from Sanity (e.g. "2026-06-19T18:00:00.000Z")
  description: string | null;
  meetingUrl: string;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tatforanimals.com';

// Announce time is shown in Pacific (Tapas's zone); Intl handles PST/PDT for us.
// e.g. "Thursday, June 19, 2026 at 11:00 AM PDT"
function formatPacific(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'short',
  }).format(d);
}

function calendarUrl(webinar: WebinarInviteData): string {
  const params = new URLSearchParams({
    start: webinar.date,
    title: webinar.title,
    url: webinar.meetingUrl,
  });
  if (webinar.description) params.set('desc', webinar.description);
  return `${SITE_URL}/api/calendar/webinar?${params.toString()}`;
}

export function webinarInviteEmail(
  name: string | null,
  webinar: WebinarInviteData
): { subject: string; html: string } {
  const firstName = name?.split(' ')[0] ?? 'there';
  const subject = `Upcoming live webinar with Tapas — ${webinar.title}`;

  // If the date parses as ISO we get a clean PT label + a working calendar link.
  // If a pre-formatted string ever sneaks through, fall back to showing it raw
  // and quietly drop the calendar link rather than emit a broken .ics.
  const prettyDate = formatPacific(webinar.date);
  const displayDate = prettyDate ?? webinar.date;
  const showCalendar = prettyDate !== null;

  const content = `
              <h1 class="email-h1" style="margin:0 0 16px;font-family:'Georgia',serif;font-size:28px;font-weight:500;color:#1C1007;line-height:1.3;">
                ${webinar.title}
              </h1>
              <p style="margin:0;font-size:17px;color:rgba(28,16,7,0.65);line-height:1.7;">
                Hi ${escapeHtml(firstName)}, your next live webinar with Tapas is coming up.
              </p>

              <!-- When -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td style="padding-top:28px;border-top:1px solid rgba(28,16,7,0.08);text-align:center;">
                    <p style="margin:0 0 6px;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#38601E;font-weight:600;">
                      When
                    </p>
                    <p style="margin:0;font-size:18px;color:#1C1007;font-weight:600;line-height:1.5;">
                      ${displayDate}
                    </p>
                    ${showCalendar ? `
                    <p style="margin:8px 0 0;font-size:14px;color:rgba(28,16,7,0.55);line-height:1.6;">
                      Shown in Pacific Time &middot; add it to your calendar below to see your own local time.
                    </p>
                    ` : ''}
                    <p style="margin:16px 0 0;font-size:15px;color:rgba(28,16,7,0.65);line-height:1.7;">
                      A question and answer session followed by a led group TAT session supporting all the animals present (and their people, too).
                    </p>
                    ${webinar.description ? `
                    <p style="margin:16px 0 0;font-size:15px;color:rgba(28,16,7,0.65);line-height:1.7;">
                      ${webinar.description}
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>
              ${emailButton(webinar.meetingUrl, 'Join the webinar &rarr;')}
              ${showCalendar ? `
              <p style="margin:20px 0 0;">
                <a href="${calendarUrl(webinar)}"
                  style="color:#38601E;font-size:15px;font-weight:600;text-decoration:underline;">
                  Add to your calendar &rarr;
                </a>
              </p>
              ` : ''}`;

  const html = emailShell({
    title: subject,
    eyebrow: 'Live Webinar',
    content,
    footerNote: "You're receiving this as a member of The Calm Circle.",
  });

  return { subject, html };
}
