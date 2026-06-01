export function accountDeletionEmail(confirmUrl: string): { subject: string; html: string } {
  const subject = 'Confirm your account deletion — TAT for Animals'

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
                TAT for Animals
              </p>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding-bottom:32px;border-bottom:1px solid rgba(28,16,7,0.08);">
              <h1 style="margin:0 0 16px;font-size:28px;font-weight:500;color:#1C1007;line-height:1.3;">
                Confirm account deletion
              </h1>
              <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:17px;color:rgba(28,16,7,0.6);line-height:1.7;font-weight:300;">
                We received a request to delete your TAT for Animals account.
                If this was you, click the button below to confirm.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:32px 0;border-bottom:1px solid rgba(28,16,7,0.08);">
              <p style="margin:0 0 20px;font-family:'Helvetica Neue',sans-serif;font-size:15px;color:rgba(28,16,7,0.6);line-height:1.7;font-weight:300;">
                This link expires in 24 hours. If you didn't request this, you can safely ignore this email.
              </p>
              <a href="${confirmUrl}"
                style="display:inline-block;padding:14px 32px;background:#1C1007;color:#FBF5F3;font-family:'Helvetica Neue',sans-serif;font-size:15px;font-weight:600;text-decoration:none;border-radius:100px;">
                Yes, delete my account →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;">
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
  `.trim()

  return { subject, html }
}
