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
 * Escape URL for safe use in HTML href attributes
 * Validates URL format and encodes special characters
 */
function escapeUrlForHref(url: string): string {
  try {
    // Validate it's a proper URL
    const parsed = new URL(url);
    // Only allow http/https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      console.warn(`Invalid URL protocol: ${parsed.protocol}`);
      return "#";
    }
    // Return the href which is already properly encoded
    return parsed.href;
  } catch {
    console.warn(`Invalid URL format: ${url}`);
    return "#";
  }
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

// =============================================================================
// Application Decision Emails (Story 1.9)
// =============================================================================

/**
 * Send welcome email when application is approved
 */
export async function sendWelcomeEmail({
  email,
  name,
  loginUrl,
}: {
  email: string;
  name: string;
  loginUrl: string;
}): Promise<void> {
  if (!resend) {
    console.log("Resend not configured - skipping welcome email");
    return;
  }

  const { error } = await resend.emails.send({
    from: DEFAULT_FROM_EMAIL,
    to: email,
    subject: "Welcome to Art Res! 🎉",
    html: getWelcomeEmailHtml(name, loginUrl),
    text: getWelcomeEmailText(name, loginUrl),
  });

  if (error) {
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
}

/**
 * HTML template for welcome email (approval)
 */
function getWelcomeEmailHtml(name: string, loginUrl: string): string {
  const safeName = escapeHtml(name);
  const safeLoginUrl = escapeUrlForHref(loginUrl);
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Art Res!</title>
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
            <span style="font-size: 32px;">🎉</span>
          </div>

          <h2 style="color: #1f2937; font-size: 24px; font-weight: 600; margin: 0 0 16px;">Welcome to the Community!</h2>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 16px;">
            Hi ${safeName},
          </p>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
            Congratulations! Your application to join Art Res has been approved. You're now part of our curated community of creative professionals who share their homes with fellow members.
          </p>

          <!-- CTA Button -->
          <a href="${safeLoginUrl}" style="display: inline-block; background-color: #2C5545; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; margin-bottom: 24px;">
            Sign In to Get Started
          </a>

          <!-- Getting Started Guide -->
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin-top: 24px; text-align: left;">
            <h3 style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 16px;">Getting Started Guide</h3>

            <ol style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>Complete your profile</strong> - Add more details about yourself and your creative work</li>
              <li><strong>List your home</strong> - Share your space with fellow community members</li>
              <li><strong>Browse listings</strong> - Discover amazing homes from other artists and creatives</li>
              <li><strong>Connect with members</strong> - Message other members to learn more about them</li>
            </ol>
          </div>

          <p style="color: #9ca3af; font-size: 14px; margin: 24px 0 0;">
            Welcome to Art Res. We're excited to have you!
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
 * Plain text version of welcome email
 */
function getWelcomeEmailText(name: string, loginUrl: string): string {
  return `Welcome to Art Res! 🎉

Hi ${name},

Congratulations! Your application to join Art Res has been approved. You're now part of our curated community of creative professionals who share their homes with fellow members.

Sign in to get started: ${loginUrl}

GETTING STARTED GUIDE
=====================

1. Complete your profile - Add more details about yourself and your creative work
2. List your home - Share your space with fellow community members
3. Browse listings - Discover amazing homes from other artists and creatives
4. Connect with members - Message other members to learn more about them

Welcome to Art Res. We're excited to have you!

© ${new Date().getFullYear()} Art Res. All rights reserved.
`;
}

/**
 * Send rejection email with feedback and refund confirmation
 */
export async function sendRejectionEmail({
  email,
  name,
  feedback,
  refundProcessed,
}: {
  email: string;
  name: string;
  feedback: string;
  refundProcessed: boolean;
}): Promise<void> {
  if (!resend) {
    console.log("Resend not configured - skipping rejection email");
    return;
  }

  const { error } = await resend.emails.send({
    from: DEFAULT_FROM_EMAIL,
    to: email,
    subject: "Art Res Application Update",
    html: getRejectionEmailHtml(name, feedback, refundProcessed),
    text: getRejectionEmailText(name, feedback, refundProcessed),
  });

  if (error) {
    throw new Error(`Failed to send rejection email: ${error.message}`);
  }
}

/**
 * HTML template for rejection email
 */
function getRejectionEmailHtml(name: string, feedback: string, refundProcessed: boolean): string {
  const safeName = escapeHtml(name);
  const safeFeedback = escapeHtml(feedback);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Art Res Application Update</title>
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
        <div>
          <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px;">Application Update</h2>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 16px;">
            Hi ${safeName},
          </p>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
            Thank you for your interest in joining the Art Res community. After careful review, we're unable to approve your application at this time.
          </p>

          <!-- Feedback Box -->
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 8px;">Feedback from our team:</p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">${safeFeedback}</p>
          </div>

          ${refundProcessed ? `
          <!-- Refund Confirmation -->
          <div style="background-color: #dcfce7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0;">
              ✓ Refund Processed
            </p>
            <p style="color: #166534; font-size: 14px; margin: 8px 0 0;">
              Your $300 membership fee has been refunded. Please allow 5-10 business days for the refund to appear on your statement.
            </p>
          </div>
          ` : `
          <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              If you made a payment, our team will process your refund separately. Please contact us if you have questions.
            </p>
          </div>
          `}

          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
            We appreciate your understanding. If you have any questions, please don't hesitate to reply to this email.
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
 * Plain text version of rejection email
 */
function getRejectionEmailText(name: string, feedback: string, refundProcessed: boolean): string {
  const refundText = refundProcessed
    ? "\nREFUND PROCESSED\nYour $300 membership fee has been refunded. Please allow 5-10 business days for the refund to appear on your statement.\n"
    : "\nIf you made a payment, our team will process your refund separately. Please contact us if you have questions.\n";

  return `Art Res Application Update

Hi ${name},

Thank you for your interest in joining the Art Res community. After careful review, we're unable to approve your application at this time.

FEEDBACK FROM OUR TEAM:
${feedback}
${refundText}
We appreciate your understanding. If you have any questions, please don't hesitate to reply to this email.

© ${new Date().getFullYear()} Art Res. All rights reserved.
`;
}

/**
 * Send info request email when admin needs more information
 */
export async function sendInfoRequestEmail({
  email,
  name,
  requestedInfo,
  updateUrl,
}: {
  email: string;
  name: string;
  requestedInfo: string;
  updateUrl: string;
}): Promise<void> {
  if (!resend) {
    console.log("Resend not configured - skipping info request email");
    return;
  }

  const { error } = await resend.emails.send({
    from: DEFAULT_FROM_EMAIL,
    to: email,
    subject: "Art Res Application - Additional Information Needed",
    html: getInfoRequestEmailHtml(name, requestedInfo, updateUrl),
    text: getInfoRequestEmailText(name, requestedInfo, updateUrl),
  });

  if (error) {
    throw new Error(`Failed to send info request email: ${error.message}`);
  }
}

/**
 * HTML template for info request email
 */
function getInfoRequestEmailHtml(name: string, requestedInfo: string, updateUrl: string): string {
  const safeName = escapeHtml(name);
  const safeRequestedInfo = escapeHtml(requestedInfo);
  const safeUpdateUrl = escapeUrlForHref(updateUrl);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Additional Information Needed - Art Res</title>
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
        <div>
          <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px;">Additional Information Needed</h2>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 16px;">
            Hi ${safeName},
          </p>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
            Thank you for applying to Art Res! We're reviewing your application and need a bit more information before we can make a decision.
          </p>

          <!-- Request Box -->
          <div style="background-color: #fef3c7; border-left: 4px solid #C4A77D; border-radius: 4px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 8px;">What we need:</p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">${safeRequestedInfo}</p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center;">
            <a href="${safeUpdateUrl}" style="display: inline-block; background-color: #2C5545; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; margin-bottom: 24px;">
              Update My Application
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 14px; margin: 24px 0 0; text-align: center;">
            Once you've provided the information, we'll continue reviewing your application.
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
 * Plain text version of info request email
 */
function getInfoRequestEmailText(name: string, requestedInfo: string, updateUrl: string): string {
  return `Additional Information Needed - Art Res

Hi ${name},

Thank you for applying to Art Res! We're reviewing your application and need a bit more information before we can make a decision.

WHAT WE NEED:
${requestedInfo}

Update your application here: ${updateUrl}

Once you've provided the information, we'll continue reviewing your application.

© ${new Date().getFullYear()} Art Res. All rights reserved.
`;
}
