// ---------------------------------------------------------------------------
// Brevo Transactional Email Client
// Uses the official @getbrevo/brevo v2 SDK (BrevoClient pattern)
// Docs: https://developers.brevo.com/docs/send-a-transactional-email
// ---------------------------------------------------------------------------

import { BrevoClient } from "@getbrevo/brevo"

// ── Types ──────────────────────────────────────────────────────────────────

export type EmailRecipient = {
  email: string
  name?: string
}

export type SendEmailParams = {
  to: EmailRecipient | EmailRecipient[]
  subject: string
  htmlContent: string
  textContent?: string
  replyTo?: EmailRecipient
  /** Optional: override the default sender for this email */
  sender?: EmailRecipient
}

export type EmailResult = {
  success: boolean
  messageId?: string
  error?: string
}

// ── Client singleton ───────────────────────────────────────────────────────

let _client: BrevoClient | undefined

function getClient(): BrevoClient {
  if (_client) return _client

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not set in environment variables")
  }

  _client = new BrevoClient({ apiKey })
  return _client
}

// ── Core send function ─────────────────────────────────────────────────────

/**
 * Send a transactional email via Brevo.
 * Backend-only — never expose API key to the frontend.
 */
export async function sendEmail(params: SendEmailParams): Promise<EmailResult> {
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  const senderName = process.env.BREVO_SENDER_NAME || "Zahan"
  const replyToEmail = process.env.BREVO_REPLY_TO

  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL is not set in environment variables")
  }

  try {
    const client = getClient()

    // Normalize recipients to array
    const toList = Array.isArray(params.to) ? params.to : [params.to]

    // Build reply-to (param override > env > none)
    const replyTo =
      params.replyTo ?? (replyToEmail ? { email: replyToEmail } : undefined)

    const response = await client.transactionalEmails.sendTransacEmail({
      sender: params.sender ?? { email: senderEmail, name: senderName },
      to: toList,
      subject: params.subject,
      htmlContent: params.htmlContent,
      ...(params.textContent ? { textContent: params.textContent } : {}),
      ...(replyTo ? { replyTo } : {}),
    })

    const messageId = response.data?.messageId

    return { success: true, messageId }
  } catch (err: any) {
    const message =
      err?.body?.message ||
      err?.response?.body?.message ||
      err?.message ||
      "Unknown error sending email"
    console.error("[Brevo] sendEmail error:", message)
    return { success: false, error: message }
  }
}
