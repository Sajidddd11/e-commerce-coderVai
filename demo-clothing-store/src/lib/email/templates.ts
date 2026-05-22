// ---------------------------------------------------------------------------
// Transactional Email Templates — Zahan Brand Theme
// Fonts: Montserrat (headings) · Inter (body)
// Colors: #0a0a0a (black), #ffffff (white), #6fe8ff (accent cyan)
// ---------------------------------------------------------------------------

import { sendEmail, EmailResult } from "./brevo"

const storeName = () => process.env.BREVO_SENDER_NAME || "Zahan"
const storeUrl = () => process.env.NEXT_PUBLIC_STORE_URL || "https://zahan.com.bd"

// ── Shared design tokens ────────────────────────────────────────────────────
const C = {
  bg: "#f5f5f5",
  card: "#ffffff",
  header: "#0a0a0a",
  headerBorder: "rgba(111,232,255,0.4)",
  accent: "#6fe8ff",
  accentDark: "#0891b2",
  text: "#111827",
  textMuted: "#6b7280",
  textLight: "#9ca3af",
  border: "#e5e7eb",
  danger: "#ef4444",
  success: "#10b981",
  footerBg: "#0a0a0a",
  footerText: "#6b7280",
  btnPrimary: "#0a0a0a",
  btnPrimaryText: "#ffffff",
  btnAccent: "#6fe8ff",
  btnAccentText: "#0a0a0a",
}

// ── Google Fonts import for emails (supported in most clients) ──────────────
const fontImport = `
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
`

// ── Shared HTML email wrapper ───────────────────────────────────────────────
function emailWrapper(content: string, preheader = ""): string {
  const name = storeName()
  const url = storeUrl()

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${name}</title>
  ${fontImport}
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: ${C.bg}; -webkit-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; display: block; max-width: 100%; -ms-interpolation-mode: bicubic; }
    a { color: ${C.accentDark}; text-decoration: none; }
    .font-montserrat { font-family: 'Montserrat', -apple-system, 'Segoe UI', sans-serif !important; }
    .font-inter { font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif !important; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .stack-column { display: block !important; width: 100% !important; }
      .product-img { width: 72px !important; height: 72px !important; }
      .hide-mobile { display: none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${C.bg};">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}
  
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${C.bg};padding:32px 16px;">
    <tr><td align="center">
      
      <!-- Email container -->
      <table class="email-container" width="600" cellpadding="0" cellspacing="0" role="presentation"
             style="max-width:600px;width:100%;">

        <!-- ═══ HEADER ═══ -->
        <tr>
          <td style="background:${C.header};border-radius:12px 12px 0 0;padding:28px 40px;text-align:center;border-bottom:2px solid ${C.headerBorder};">
            <a href="${url}" style="text-decoration:none;">
              <span class="font-montserrat" style="font-family:'Montserrat',-apple-system,sans-serif;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">
                ${name}
              </span>
            </a>
          </td>
        </tr>

        <!-- ═══ BODY ═══ -->
        <tr>
          <td style="background:${C.card};padding:40px 40px 32px;border-left:1px solid ${C.border};border-right:1px solid ${C.border};">
            <div class="font-inter" style="font-family:'Inter',-apple-system,sans-serif;color:${C.text};font-size:15px;line-height:1.7;">
              ${content}
            </div>
          </td>
        </tr>

        <!-- ═══ FOOTER ═══ -->
        <tr>
          <td style="background:${C.footerBg};border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
            <p class="font-inter" style="font-family:'Inter',-apple-system,sans-serif;margin:0 0 8px;font-size:12px;color:${C.footerText};">
              © ${new Date().getFullYear()} ${name} · All rights reserved
            </p>
            <p style="margin:0;font-size:12px;color:#4b5563;">
              <a href="${url}" style="color:${C.accent};text-decoration:none;">${url.replace("https://", "")}</a>
              &nbsp;·&nbsp;
              <a href="${url}/contact" style="color:${C.footerText};text-decoration:none;">Contact</a>
              &nbsp;·&nbsp;
              <a href="${url}/account/orders" style="color:${C.footerText};text-decoration:none;">My Orders</a>
            </p>
            <p style="margin:10px 0 0;font-size:11px;color:#374151;">
              This is an automated message — please do not reply directly.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Heading helper ──────────────────────────────────────────────────────────
function h2(text: string) {
  return `<h2 class="font-montserrat" style="font-family:'Montserrat',-apple-system,sans-serif;margin:0 0 20px;color:#0a0a0a;font-size:22px;font-weight:700;letter-spacing:0.3px;">${text}</h2>`
}

// ── Divider ─────────────────────────────────────────────────────────────────
const divider = `<hr style="border:none;border-top:1px solid ${C.border};margin:24px 0;"/>`

// ── Primary button ──────────────────────────────────────────────────────────
function btnPrimary(text: string, href: string) {
  return `
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
      <tr>
        <td style="background:${C.btnPrimary};border-radius:8px;padding:14px 32px;">
          <a href="${href}" class="font-inter"
             style="font-family:'Inter',-apple-system,sans-serif;color:${C.btnPrimaryText};font-size:15px;font-weight:600;text-decoration:none;display:inline-block;letter-spacing:0.3px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>`
}

// ── Accent button ───────────────────────────────────────────────────────────
function btnAccent(text: string, href: string) {
  return `
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
      <tr>
        <td style="background:${C.btnAccent};border-radius:8px;padding:14px 32px;">
          <a href="${href}" class="font-inter"
             style="font-family:'Inter',-apple-system,sans-serif;color:${C.btnAccentText};font-size:15px;font-weight:700;text-decoration:none;display:inline-block;letter-spacing:0.3px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>`
}

// ── Info box ─────────────────────────────────────────────────────────────────
function infoBox(label: string, value: string) {
  return `
    <div style="background:#f9fafb;border-radius:8px;border-left:4px solid ${C.accent};padding:16px 20px;margin-bottom:16px;">
      <p class="font-inter" style="font-family:'Inter',-apple-system,sans-serif;margin:0 0 4px;font-size:11px;color:${C.textLight};text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">${label}</p>
      <p class="font-montserrat" style="font-family:'Montserrat',-apple-system,sans-serif;margin:0;font-size:20px;font-weight:700;color:#0a0a0a;">${value}</p>
    </div>`
}


// ════════════════════════════════════════════════════════════════════════════
// 1. WELCOME EMAIL
// ════════════════════════════════════════════════════════════════════════════

export async function sendWelcomeEmail(params: {
  to: string
  name: string
}): Promise<EmailResult> {
  const name = storeName()
  const url = storeUrl()

  const html = emailWrapper(`
    ${h2(`Welcome to ${name}! 🎉`)}
    <p style="margin:0 0 12px;color:${C.text};">
      Hi <strong>${params.name}</strong>,
    </p>
    <p style="margin:0 0 24px;color:${C.textMuted};">
      Your account has been created successfully. We're thrilled to have you join the ${name} family.
      Explore our latest collections — from premium fragrances to exclusive fashion.
    </p>
    ${btnPrimary("Start Shopping →", `${url}/shop`)}
    ${divider}
    <p style="margin:0;color:${C.textMuted};font-size:13px;">
      If you didn't create this account, you can safely ignore this email.
    </p>
  `, `Welcome to ${name} — your account is ready!`)

  return sendEmail({
    to: { email: params.to, name: params.name },
    subject: `Welcome to ${name}! Your account is ready ✨`,
    htmlContent: html,
    textContent: `Welcome to ${name}, ${params.name}! Your account has been created. Visit us at ${url}`,
  })
}


// ════════════════════════════════════════════════════════════════════════════
// 2. OTP EMAIL
// ════════════════════════════════════════════════════════════════════════════

export async function sendOtpEmail(params: {
  to: string
  name?: string
  otp: string
  expiryMinutes?: number
}): Promise<EmailResult> {
  const expiry = params.expiryMinutes ?? 5

  const html = emailWrapper(`
    ${h2("Verification Code")}
    <p style="margin:0 0 24px;color:${C.textMuted};">
      ${params.name ? `Hi <strong>${params.name}</strong>, use` : "Use"} the code below to verify your identity.
      It expires in <strong>${expiry} minutes</strong>.
    </p>

    <!-- OTP Box -->
    <table cellpadding="0" cellspacing="0" role="presentation" width="100%" style="margin:0 0 24px;">
      <tr>
        <td style="background:#0a0a0a;border-radius:12px;padding:28px;text-align:center;">
          <span class="font-montserrat"
                style="font-family:'Montserrat',-apple-system,sans-serif;font-size:44px;font-weight:800;letter-spacing:14px;color:${C.accent};display:inline-block;">
            ${params.otp}
          </span>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;color:${C.danger};font-size:13px;font-weight:600;">
      ⚠️ Never share this code with anyone — ${storeName()} will never ask for it.
    </p>
    <p style="margin:0;color:${C.textMuted};font-size:13px;">
      If you didn't request this, you can safely ignore this email.
    </p>
  `, `Your verification code: ${params.otp}`)

  return sendEmail({
    to: { email: params.to, name: params.name },
    subject: `${params.otp} — Your ${storeName()} verification code`,
    htmlContent: html,
    textContent: `Your ${storeName()} OTP is: ${params.otp}\n\nValid for ${expiry} minutes. Do not share this code.`,
  })
}


// ════════════════════════════════════════════════════════════════════════════
// 3. PASSWORD RESET EMAIL
// ════════════════════════════════════════════════════════════════════════════

export async function sendPasswordResetEmail(params: {
  to: string
  name?: string
  resetLink: string
  expiryMinutes?: number
}): Promise<EmailResult> {
  const expiry = params.expiryMinutes ?? 30
  const name = storeName()

  const html = emailWrapper(`
    ${h2("Reset Your Password")}
    <p style="margin:0 0 8px;color:${C.text};">
      ${params.name ? `Hi <strong>${params.name}</strong>,` : "Hi there,"}
    </p>
    <p style="margin:0 0 24px;color:${C.textMuted};">
      We received a request to reset your ${name} account password.
      Click the button below — this link expires in <strong>${expiry} minutes</strong>.
    </p>
    ${btnAccent("Reset My Password →", params.resetLink)}
    <p style="margin:0 0 6px;color:${C.textMuted};font-size:12px;">Or paste this link in your browser:</p>
    <p style="margin:0 0 20px;font-size:12px;word-break:break-all;">
      <a href="${params.resetLink}" style="color:${C.accentDark};">${params.resetLink}</a>
    </p>
    ${divider}
    <p style="margin:0;color:${C.danger};font-size:13px;">
      If you didn't request a password reset, your account is safe — just ignore this email.
    </p>
  `, "Reset your Zahan account password")

  return sendEmail({
    to: { email: params.to, name: params.name },
    subject: `Reset your ${name} password`,
    htmlContent: html,
    textContent: `Reset your password here: ${params.resetLink}\n\nExpires in ${expiry} minutes.`,
  })
}


// ════════════════════════════════════════════════════════════════════════════
// 4. ORDER CONFIRMATION EMAIL (with product items + images)
// ════════════════════════════════════════════════════════════════════════════

export type OrderEmailItem = {
  name: string
  variant?: string
  qty: number
  price: string
  imageUrl?: string
}

export async function sendOrderConfirmationEmail(params: {
  to: string
  name: string
  orderNumber: string | number
  orderTotal: string
  items?: OrderEmailItem[]
  shippingAddress?: {
    line1?: string
    line2?: string
    city?: string
  }
}): Promise<EmailResult> {
  const name = storeName()
  const url = storeUrl()
  const orderUrl = `${url}/account/orders`

  // ── Product rows ──────────────────────────────────────────────────────────
  const itemRows = (params.items ?? []).map((item) => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid ${C.border};vertical-align:top;">
        <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
          <tr>
            ${item.imageUrl ? `
            <td width="80" style="padding-right:14px;vertical-align:top;">
              <img class="product-img" src="${item.imageUrl}" alt="${item.name}"
                   width="80" height="80"
                   style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid ${C.border};" />
            </td>` : ""}
            <td style="vertical-align:top;">
              <p class="font-inter" style="font-family:'Inter',-apple-system,sans-serif;margin:0 0 4px;font-size:14px;font-weight:600;color:${C.text};">${item.name}</p>
              ${item.variant ? `<p style="margin:0 0 4px;font-size:12px;color:${C.textMuted};">${item.variant}</p>` : ""}
              <p style="margin:0;font-size:13px;color:${C.textMuted};">Qty: ${item.qty}</p>
            </td>
            <td style="vertical-align:top;text-align:right;white-space:nowrap;">
              <p class="font-montserrat" style="font-family:'Montserrat',-apple-system,sans-serif;margin:0;font-size:14px;font-weight:600;color:${C.text};">${item.price}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("")

  // ── Totals row ─────────────────────────────────────────────────────────────
  const totalRow = `
    <tr>
      <td style="padding:16px 0 0;">
        <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
          <tr>
            <td>
              <span class="font-montserrat" style="font-family:'Montserrat',-apple-system,sans-serif;font-size:15px;font-weight:700;color:${C.text};">Total</span>
            </td>
            <td style="text-align:right;">
              <span class="font-montserrat" style="font-family:'Montserrat',-apple-system,sans-serif;font-size:16px;font-weight:800;color:#0a0a0a;">${params.orderTotal}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `

  const shippingInfo = params.shippingAddress
    ? `${divider}
       <p style="margin:0 0 6px;font-size:11px;color:${C.textLight};text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Shipping To</p>
       <p style="margin:0;font-size:14px;color:${C.text};">
         ${[params.shippingAddress.line1, params.shippingAddress.line2, params.shippingAddress.city].filter(Boolean).join(", ")}
       </p>`
    : ""

  const html = emailWrapper(`
    <!-- Success badge -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:100px;padding:8px 20px;">
        <span style="color:${C.success};font-size:13px;font-weight:600;">✓ Order Confirmed</span>
      </div>
    </div>

    ${h2("Thank you for your order!")}
    <p style="margin:0 0 24px;color:${C.textMuted};">
      Hi <strong>${params.name}</strong>, we've received your order and it's being processed.
      You'll be notified when it ships.
    </p>

    ${infoBox("Order Number", `#${params.orderNumber}`)}

    ${params.items?.length ? `
    <!-- Product items -->
    ${divider}
    <p class="font-montserrat" style="font-family:'Montserrat',-apple-system,sans-serif;margin:0 0 12px;font-size:13px;font-weight:700;color:${C.text};text-transform:uppercase;letter-spacing:0.8px;">
      Items Ordered
    </p>
    <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
      ${itemRows}
      ${totalRow}
    </table>
    ` : ""}

    ${shippingInfo}

    ${btnPrimary("View My Order →", orderUrl)}

    ${divider}
    <p style="margin:0;color:${C.textMuted};font-size:13px;">
      Questions? Contact us at
      <a href="mailto:${process.env.BREVO_SENDER_EMAIL}" style="color:${C.accentDark};">${process.env.BREVO_SENDER_EMAIL}</a>
    </p>
  `, `Your ${name} order #${params.orderNumber} is confirmed!`)

  return sendEmail({
    to: { email: params.to, name: params.name },
    subject: `Order #${params.orderNumber} confirmed — ${name} 🛍️`,
    htmlContent: html,
    textContent: `Hi ${params.name}, your order #${params.orderNumber} has been confirmed. Total: ${params.orderTotal}. Track it at ${orderUrl}`,
  })
}
