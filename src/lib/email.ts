/**
 * Email utilities re-export
 *
 * Re-exports email functions from the Resend service for easier imports.
 */

export {
  sendBookingRequestEmail,
  sendBookingConfirmationEmail,
  sendBookingDeclinedEmail,
} from "~/lib/services/resend";
