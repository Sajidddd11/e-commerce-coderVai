// ---------------------------------------------------------------------------
// Transactional Email Helpers
// Wraps sendEmail() with pre-built subject lines and HTML templates
// ---------------------------------------------------------------------------

import { sendEmail, EmailResult } from "./brevo"

const storeName = () => process.env.BREVO_SENDER_NAME || "Zahan"
const storeUrl = () => process.env.NEXT_PUBLIC_STORE_URL || "https://zahan.com.bd"

// ── Shared HTML wrapper ────────────────────────────────────────────────────

function emailWrapper(content: string): string {
  const name = storeName()
  const url = storeUrl()
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:28px 40px;text-align:center;">
              <a href="${url}" style="color:#ffffff;font-size:22px;font-weight:700;text-decoration:none;letter-spacing:1px;">${name}</a>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9f9fb;padding:20px 40px;text-align:center;border-top:1px solid #ececec;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} ${name} · 
                <a href="${url}" style="color:#6366f1;text-decoration:none;">${url.replace("https://","")}</a>
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#d1d5db;">
                This is an automated message. Please do not reply directly to this email.
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
}

// ── 1. Welcome Email ───────────────────────────────────────────────────────

export async function sendWelcomeEmail(params: {
  to: string
  name: string
}): Promise<EmailResult> {
  const name = storeName()
  const html = emailWrapper(`
    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:24px;">Welcome to ${name}! 🎉</h2>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 12px;">
      Hi <strong>${params.name}</strong>,
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Your account has been created successfully. We're excited to have you with us.
      Start exploring our latest collections today!
    </p>
    <a href="${storeUrl()}/shop" 
       style="display:inline-block;background:#1a1a2e;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
      Shop Now
    </a>
    <p style="margin:24px 0 0;color:#6b7280;font-size:13px;">
      If you didn't create this account, please ignore this email.
    </p>
  `)

  return sendEmail({
    to: { email: params.to, name: params.name },
    subject: `Welcome to ${name}!`,
    htmlContent: html,
    textContent: `Welcome to ${name}, ${params.name}! Your account has been created. Visit us at ${storeUrl()}`,
  })
}

// ── 2. OTP / Password Reset Email ─────────────────────────────────────────

export async function sendOtpEmail(params: {
  to: string
  name?: string
  otp: string
  expiryMinutes?: number
}): Promise<EmailResult> {
  const expiry = params.expiryMinutes ?? 5
  const html = emailWrapper(`
    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:24px;">Your OTP Code</h2>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
      ${params.name ? `Hi <strong>${params.name}</strong>,<br/><br/>` : ""}
      Use the code below to verify your identity. This code expires in <strong>${expiry} minutes</strong>.
    </p>
    <!-- OTP box -->
    <div style="background:#f4f4f5;border-radius:10px;padding:24px;text-align:center;margin:0 0 24px;">
      <span style="font-size:40px;font-weight:800;letter-spacing:10px;color:#1a1a2e;font-family:monospace;">
        ${params.otp}
      </span>
    </div>
    <p style="color:#ef4444;font-size:13px;margin:0 0 8px;">
      ⚠️ Never share this code with anyone.
    </p>
    <p style="color:#6b7280;font-size:13px;margin:0;">
      If you didn't request this, you can safely ignore this email.
    </p>
  `)

  return sendEmail({
    to: { email: params.to, name: params.name },
    subject: `Your ${storeName()} verification code: ${params.otp}`,
    htmlContent: html,
    textContent: `Your ${storeName()} OTP is: ${params.otp}\n\nValid for ${expiry} minutes. Do not share this code.`,
  })
}

// ── 3. Password Reset Email ────────────────────────────────────────────────

export async function sendPasswordResetEmail(params: {
  to: string
  name?: string
  resetLink: string
  expiryMinutes?: number
}): Promise<EmailResult> {
  const expiry = params.expiryMinutes ?? 30
  const html = emailWrapper(`
    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:24px;">Reset Your Password</h2>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 8px;">
      ${params.name ? `Hi <strong>${params.name}</strong>,` : "Hi there,"}
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
      We received a request to reset your password. Click the button below to create a new one. 
      This link will expire in <strong>${expiry} minutes</strong>.
    </p>
    <a href="${params.resetLink}"
       style="display:inline-block;background:#6366f1;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
      Reset Password
    </a>
    <p style="margin:20px 0 0;color:#6b7280;font-size:13px;">
      Or copy this link: <br/>
      <a href="${params.resetLink}" style="color:#6366f1;word-break:break-all;">${params.resetLink}</a>
    </p>
    <p style="margin:16px 0 0;color:#ef4444;font-size:13px;">
      If you didn't request a password reset, please ignore this email — your password won't change.
    </p>
  `)

  return sendEmail({
    to: { email: params.to, name: params.name },
    subject: `Reset your ${storeName()} password`,
    htmlContent: html,
    textContent: `Reset your password here: ${params.resetLink}\n\nExpires in ${expiry} minutes. If you didn't request this, ignore this email.`,
  })
}

// ── 4. Order Confirmation Email ────────────────────────────────────────────

export async function sendOrderConfirmationEmail(params: {
  to: string
  name: string
  orderNumber: string | number
  orderTotal: string
  items?: { name: string; qty: number; price: string }[]
}): Promise<EmailResult> {
  const name = storeName()
  const itemRows = (params.items ?? [])
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#374151;font-size:14px;">${item.name}</td>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#6b7280;font-size:14px;text-align:center;">×${item.qty}</td>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#374151;font-size:14px;text-align:right;">${item.price}</td>
        </tr>`
    )
    .join("")

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:24px;">Order Confirmed! ✅</h2>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Hi <strong>${params.name}</strong>, thank you for your order! 
      We've received it and will process it shortly.
    </p>
    <!-- Order info box -->
    <div style="background:#f9f9fb;border-radius:10px;padding:20px 24px;margin:0 0 24px;border-left:4px solid #6366f1;">
      <p style="margin:0 0 6px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Order Number</p>
      <p style="margin:0;font-size:22px;font-weight:700;color:#1a1a2e;">#${params.orderNumber}</p>
    </div>
    ${
      itemRows
        ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <th style="text-align:left;font-size:12px;color:#9ca3af;text-transform:uppercase;padding-bottom:8px;">Item</th>
        <th style="text-align:center;font-size:12px;color:#9ca3af;text-transform:uppercase;padding-bottom:8px;">Qty</th>
        <th style="text-align:right;font-size:12px;color:#9ca3af;text-transform:uppercase;padding-bottom:8px;">Price</th>
      </tr>
      ${itemRows}
      <tr>
        <td colspan="2" style="padding-top:12px;font-weight:700;color:#1a1a2e;">Total</td>
        <td style="padding-top:12px;font-weight:700;color:#1a1a2e;text-align:right;">${params.orderTotal}</td>
      </tr>
    </table>`
        : ""
    }
    <a href="${storeUrl()}/account/orders/${params.orderNumber}"
       style="display:inline-block;background:#1a1a2e;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
      View Order
    </a>
    <p style="margin:20px 0 0;color:#6b7280;font-size:13px;">
      Questions? Contact us at 
      <a href="mailto:${process.env.BREVO_SENDER_EMAIL}" style="color:#6366f1;">
        ${process.env.BREVO_SENDER_EMAIL}
      </a>
    </p>
  `)

  return sendEmail({
    to: { email: params.to, name: params.name },
    subject: `Order #${params.orderNumber} confirmed — ${name}`,
    htmlContent: html,
    textContent: `Hi ${params.name}, your order #${params.orderNumber} has been confirmed. Total: ${params.orderTotal}. Track it at ${storeUrl()}/account/orders/${params.orderNumber}`,
  })
}
