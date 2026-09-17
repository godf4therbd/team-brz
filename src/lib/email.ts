import { Resend } from "resend";

// Free email sending via Resend (resend.com) — 100 emails/day, 3,000/month
// on the free tier, no credit card needed. Set RESEND_API_KEY in your env.
// Until you verify your own domain with Resend, EMAIL_FROM must stay
// "onboarding@resend.dev" (Resend's shared sending address) — see README
// "Email verification / notifications" for the full setup.
//
// If RESEND_API_KEY isn't set (e.g. local dev where you haven't set this
// up), we just log the email to the console instead of throwing, so the
// rest of the app keeps working.

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "Team Brz <onboarding@resend.dev>";

function siteUrl(): string {
  return (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(
      `[email] RESEND_API_KEY not set — skipping send. Would have sent "${subject}" to ${to}`
    );
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    // Never let an email failure break the request that triggered it
    // (signup, admin verifying someone, etc.) — just log it.
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err);
  }
}

function wrapper(title: string, bodyHtml: string): string {
  return `
  <div style="background:#0b0b0c;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#141416;border:1px solid #2a2a2d;border-radius:12px;padding:32px;">
      <h1 style="color:#f97316;font-size:20px;margin:0 0 4px;letter-spacing:0.03em;text-transform:uppercase;">
        Team Brz
      </h1>
      <h2 style="color:#ffffff;font-size:17px;margin:20px 0 12px;">${title}</h2>
      <div style="color:#c9c9cc;font-size:14px;line-height:1.6;">${bodyHtml}</div>
      <p style="color:#68686d;font-size:12px;margin-top:28px;">
        Team Brz motorcycle club
      </p>
    </div>
  </div>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0;">
    <a href="${href}" style="background:#dc2626;color:#0b0b0c;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:6px;display:inline-block;text-transform:uppercase;letter-spacing:0.03em;font-size:13px;">
      ${label}
    </a>
  </p>
  <p style="color:#68686d;font-size:12px;word-break:break-all;">
    Or paste this link into your browser: ${href}
  </p>`;
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
) {
  const link = `${siteUrl()}/api/verify-email?token=${encodeURIComponent(
    token
  )}`;
  await send(
    to,
    "Confirm your email — Team Brz",
    wrapper(
      "Confirm your email address",
      `<p>Hi ${escapeHtml(name)},</p>
       <p>Thanks for joining Team Brz. Click below to confirm this is your
       email address:</p>
       ${button(link, "Confirm email")}
       <p>This link expires in 24 hours. If you didn't create an account,
       you can ignore this email.</p>`
    )
  );
}

export async function sendVerifiedBadgeEmail(to: string, name: string) {
  await send(
    to,
    "You're verified! — Team Brz",
    wrapper(
      "You've been verified 🎖️",
      `<p>Hi ${escapeHtml(name)},</p>
       <p>An admin has verified your identity/bike ownership. Your profile
       now shows the verified badge on the members directory.</p>`
    )
  );
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
) {
  const link = `${siteUrl()}/reset-password?token=${encodeURIComponent(
    token
  )}`;
  await send(
    to,
    "Reset your password — Team Brz",
    wrapper(
      "Reset your password",
      `<p>Hi ${escapeHtml(name)},</p>
       <p>We got a request to reset your Team Brz password. Click below to
       choose a new one:</p>
       ${button(link, "Reset password")}
       <p>This link expires in 1 hour. If you didn't request this, you can
       safely ignore this email — your password won't change.</p>`
    )
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
