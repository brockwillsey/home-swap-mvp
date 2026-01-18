/**
 * Resend Email Service Client
 *
 * Used for magic link authentication and transactional emails.
 * Free tier: 3,000 emails/month, 100 emails/day
 *
 * @see https://resend.com/docs
 */

import { Resend } from "resend";
import { env } from "~/env";

/**
 * Resend client instance for sending emails
 * Requires RESEND_API_KEY environment variable
 */
export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/**
 * Default sender address for Art Res emails
 * Note: In development, use onboarding@resend.dev or verify your own domain
 */
export const DEFAULT_FROM_EMAIL = "Art Res <onboarding@resend.dev>";

/**
 * Art Res branded email template for magic link authentication
 */
export function getMagicLinkEmailHtml(url: string, host: string): string {
  const escapedHost = host.replace(/\./g, "&#8203;.");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to Art Res</title>
</head>
<body style="background-color: #FAFAF9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
  <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px;">
        <!-- Logo/Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #2C5545; font-size: 28px; font-weight: 700; margin: 0;">Art Res</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0;">Creative Home Exchange Community</p>
        </div>

        <!-- Main Content -->
        <div style="text-align: center;">
          <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px;">Sign in to your account</h2>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
            Click the button below to securely sign in to ${escapedHost}. This link will expire in 10 minutes.
          </p>

          <!-- CTA Button -->
          <a href="${url}" style="display: inline-block; background-color: #2C5545; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; margin-bottom: 24px;">
            Sign in to Art Res
          </a>

          <p style="color: #9ca3af; font-size: 14px; margin: 24px 0 0;">
            If you didn't request this email, you can safely ignore it.
          </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 24px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} Art Res. All rights reserved.
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Plain text version of magic link email
 */
export function getMagicLinkEmailText(url: string, host: string): string {
  return `Sign in to Art Res (${host})\n\nClick here to sign in: ${url}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request this email, you can safely ignore it.\n`;
}

/**
 * Send application confirmation email after successful payment
 */
export async function sendApplicationConfirmationEmail({
  email,
  name,
}: {
  email: string;
  name: string;
}): Promise<void> {
  if (!resend) {
    console.log("Resend not configured - skipping confirmation email");
    return;
  }

  const { error } = await resend.emails.send({
    from: DEFAULT_FROM_EMAIL,
    to: email,
    subject: "Application Received - Art Res",
    html: getApplicationConfirmationEmailHtml(name),
    text: getApplicationConfirmationEmailText(name),
  });

  if (error) {
    throw new Error(`Failed to send confirmation email: ${error.message}`);
  }
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] ?? char);
}

/**
 * HTML template for application confirmation email
 */
function getApplicationConfirmationEmailHtml(name: string): string {
  const safeName = escapeHtml(name);
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received - Art Res</title>
</head>
<body style="background-color: #FAFAF9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
  <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px;">
        <!-- Logo/Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #2C5545; font-size: 28px; font-weight: 700; margin: 0;">Art Res</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0;">Creative Home Exchange Community</p>
        </div>

        <!-- Main Content -->
        <div style="text-align: center;">
          <div style="width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 32px;">✓</span>
          </div>

          <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px;">Application Received!</h2>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 16px;">
            Hi ${safeName},
          </p>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
            Thank you for applying to join the Art Res community! We've received your application and payment.
          </p>

          <!-- Status Box -->
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 8px;">Application Status</p>
            <p style="color: #C4A77D; font-size: 18px; font-weight: 700; margin: 0;">Under Review</p>
          </div>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 8px;">
            <strong>What happens next?</strong>
          </p>

          <ul style="color: #6b7280; font-size: 14px; line-height: 1.6; text-align: left; margin: 0 0 24px; padding-left: 20px;">
            <li>Our team will review your application within 3-5 business days</li>
            <li>We'll check your profile, home photos, and creative background</li>
            <li>You'll receive an email once a decision has been made</li>
          </ul>

          <p style="color: #9ca3af; font-size: 14px; margin: 0;">
            If you have any questions, please reply to this email.
          </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 24px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} Art Res. All rights reserved.
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Plain text version of application confirmation email
 */
function getApplicationConfirmationEmailText(name: string): string {
  return `Application Received - Art Res

Hi ${name},

Thank you for applying to join the Art Res community! We've received your application and payment.

Application Status: Under Review

What happens next?
- Our team will review your application within 3-5 business days
- We'll check your profile, home photos, and creative background
- You'll receive an email once a decision has been made

If you have any questions, please reply to this email.

© ${new Date().getFullYear()} Art Res. All rights reserved.
`;
}
