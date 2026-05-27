import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send group invitation email to an unregistered user
 */
export const sendGroupInviteEmail = async ({ toEmail, inviterName, groupName, groupCategory, inviteLink }) => {
  const transporter = createTransporter();

  const categoryIcon = {
    trip: '✈️', home: '🏠', couple: '💑', friends: '🎉', other: '📁',
  }[groupCategory] || '📁';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to join a group on SplitLedger</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0c; font-family: 'Segoe UI', system-ui, sans-serif; color: #f1f1f3; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #111115; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a1a22 0%, #111115 100%); padding: 40px 40px 32px; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: center; }
    .logo { font-size: 22px; font-weight: 700; letter-spacing: -0.04em; color: #f5a623; margin-bottom: 24px; }
    .logo span { color: #f1f1f3; }
    .group-badge { display: inline-flex; align-items: center; gap: 10px; background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.25); border-radius: 50px; padding: 8px 20px; margin-bottom: 20px; }
    .group-icon { font-size: 20px; }
    .group-name { font-size: 15px; font-weight: 600; color: #f5a623; }
    .headline { font-size: 26px; font-weight: 700; letter-spacing: -0.03em; color: #f1f1f3; line-height: 1.3; }
    .body { padding: 32px 40px; }
    .inviter-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding: 16px; background: #18181e; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); }
    .avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #f5a623, #e08b00); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #0a0a0c; flex-shrink: 0; }
    .inviter-text { font-size: 14px; color: #9191a0; line-height: 1.5; }
    .inviter-text strong { color: #f1f1f3; }
    .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 24px 0; }
    .cta-section { text-align: center; margin: 32px 0 24px; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #f5a623, #e08b00); color: #0a0a0c; text-decoration: none; font-weight: 700; font-size: 16px; padding: 14px 36px; border-radius: 10px; letter-spacing: -0.01em; }
    .cta-sub { margin-top: 12px; font-size: 12px; color: #5c5c70; }
    .steps { margin: 24px 0; }
    .step { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
    .step-num { width: 26px; height: 26px; border-radius: 50%; background: rgba(245,166,35,0.15); border: 1px solid rgba(245,166,35,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #f5a623; flex-shrink: 0; margin-top: 1px; }
    .step-text { font-size: 14px; color: #9191a0; line-height: 1.5; }
    .step-text strong { color: #f1f1f3; }
    .footer { padding: 20px 40px 32px; text-align: center; }
    .footer-note { font-size: 12px; color: #5c5c70; line-height: 1.6; }
    .link-fallback { word-break: break-all; color: #f5a623; font-size: 12px; margin-top: 8px; }
    .expiry-badge { display: inline-block; background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.2); border-radius: 6px; padding: 4px 10px; font-size: 12px; color: #f43f5e; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo">Split<span>Ledger</span></div>
        <div class="group-badge">
          <span class="group-icon">${categoryIcon}</span>
          <span class="group-name">${groupName}</span>
        </div>
        <h1 class="headline">You've been invited<br/>to split expenses!</h1>
      </div>
      <div class="body">
        <div class="inviter-row">
          <div class="avatar">${inviterName.charAt(0).toUpperCase()}</div>
          <div class="inviter-text">
            <strong>${inviterName}</strong> wants you to join the <strong>${groupName}</strong> group on SplitLedger — the smart way to split bills, track expenses, and settle up with friends.
          </div>
        </div>

        <div class="steps">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-text"><strong>Click the button below</strong> to open your personal invite link</div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-text"><strong>Create a free account</strong> — takes less than a minute</div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-text"><strong>You'll be automatically added</strong> to the <strong>${groupName}</strong> group!</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="cta-section">
          <a href="${inviteLink}" class="cta-btn">Accept Invitation &rarr;</a>
          <div class="cta-sub">
            <span class="expiry-badge">⏱ Link expires in 7 days</span>
          </div>
        </div>
      </div>
      <div class="footer">
        <p class="footer-note">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p class="link-fallback">${inviteLink}</p>
        <div style="margin-top:16px; color:#5c5c70; font-size:11px;">
          You received this email because ${inviterName} entered your email address on SplitLedger.<br/>
          If you weren't expecting this, you can safely ignore this email.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"SplitLedger" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${inviterName} invited you to join "${groupName}" on SplitLedger`,
    html,
    text: `${inviterName} invited you to join the "${groupName}" group on SplitLedger.\n\nClick here to accept: ${inviteLink}\n\nThis link expires in 7 days.`,
  });
};
