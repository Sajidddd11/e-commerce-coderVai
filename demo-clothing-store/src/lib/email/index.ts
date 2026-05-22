// ---------------------------------------------------------------------------
// Email module barrel — import everything from here
// ---------------------------------------------------------------------------

export { sendEmail } from "./brevo"
export type { SendEmailParams, EmailResult, EmailRecipient } from "./brevo"

export {
  sendWelcomeEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
} from "./templates"

export type { OrderEmailItem } from "./templates"
