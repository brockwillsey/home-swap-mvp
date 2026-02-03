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
 * Default sender address for Musa Residency emails
 * Note: In development, use onboarding@resend.dev or verify your own domain
 */
export const DEFAULT_FROM_EMAIL = "Musa Residency <onboarding@resend.dev>";

/**
 * Musa Residency branded email template for magic link authentication
 */
export function getMagicLinkEmailHtml(url: string, host: string): string {
  const escapedHost = host.replace(/\./g, "&#8203;.");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to Musa Residency</title>
</head>
<body style="background-color: #FAFAF9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
  <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px;">
        <!-- Logo/Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #2C5545; font-size: 28px; font-weight: 700; margin: 0;">Musa Residency</h1>
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
            Sign in to Musa Residency
          </a>

          <p style="color: #9ca3af; font-size: 14px; margin: 24px 0 0;">
            If you didn't request this email, you can safely ignore it.
          </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 24px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} Musa Residency. All rights reserved.
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
  return `Sign in to Musa Residency (${host})\n\nClick here to sign in: ${url}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request this email, you can safely ignore it.\n`;
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
    subject: "Application Received - Musa Residency",
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
  <title>Application Received - Musa Residency</title>
</head>
<body style="background-color: #FAFAF9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
  <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px;">
        <!-- Logo/Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #2C5545; font-size: 28px; font-weight: 700; margin: 0;">Musa Residency</h1>
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
            Thank you for applying to join the Musa Residency community! We've received your application and payment.
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
            &copy; ${new Date().getFullYear()} Musa Residency. All rights reserved.
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
  return `Application Received - Musa Residency

Hi ${name},

Thank you for applying to join the Musa Residency community! We've received your application and payment.

Application Status: Under Review

What happens next?
- Our team will review your application within 3-5 business days
- We'll check your profile, home photos, and creative background
- You'll receive an email once a decision has been made

If you have any questions, please reply to this email.

© ${new Date().getFullYear()} Musa Residency. All rights reserved.
`;
}

// =============================================================================
// Admin Notification Emails
// =============================================================================

/**
 * Send notification to admin when a new application is submitted
 */
export async function sendNewApplicationNotificationEmail({
  adminEmail,
  applicantName,
  applicantEmail,
  location,
  roles,
  applicationId,
}: {
  adminEmail: string;
  applicantName: string;
  applicantEmail: string;
  location: string;
  roles: string;
  applicationId: string;
}): Promise<void> {
  if (!resend) {
    console.log("Resend not configured - skipping admin notification email");
    return;
  }

  const adminUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/admin/applications`;

  const { error } = await resend.emails.send({
    from: DEFAULT_FROM_EMAIL,
    to: adminEmail,
    subject: `New Membership Application - ${applicantName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #FAFAF9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
  <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #2C5545; font-size: 28px; font-weight: 700; margin: 0;">Musa Residency</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0;">Admin Notification</p>
        </div>

        <div style="background-color: #C4A77D; color: white; padding: 12px 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 16px; font-weight: 600;">🆕 New Application Submitted</span>
        </div>

        <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 24px;">Application Details</h2>

        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px;"><strong>Name:</strong> ${escapeHtml(applicantName)}</p>
          <p style="margin: 0 0 12px;"><strong>Email:</strong> ${escapeHtml(applicantEmail)}</p>
          <p style="margin: 0 0 12px;"><strong>Location:</strong> ${escapeHtml(location)}</p>
          <p style="margin: 0;"><strong>Membership Roles:</strong> ${escapeHtml(roles)}</p>
        </div>

        <div style="text-align: center;">
          <a href="${adminUrl}" style="display: inline-block; background-color: #2C5545; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
            Review Application
          </a>
        </div>

        <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 24px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This is an automated admin notification from Musa Residency.
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`,
    text: `New Membership Application - Musa Residency

A new membership application has been submitted.

APPLICANT DETAILS
=================
Name: ${applicantName}
Email: ${applicantEmail}
Location: ${location}
Membership Roles: ${roles}

Review the application at: ${adminUrl}

This is an automated admin notification from Musa Residency.
`,
  });

  if (error) {
    console.error("Failed to send admin notification email:", error);
  }
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
    subject: "Welcome to Musa Residency! 🎉",
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
  <title>Welcome to Musa Residency!</title>
</head>
<body style="background-color: #FAFAF9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
  <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px;">
        <!-- Logo/Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #2C5545; font-size: 28px; font-weight: 700; margin: 0;">Musa Residency</h1>
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
            Congratulations! Your application to join Musa Residency has been approved. You're now part of our curated community of creative professionals who share their homes with fellow members.
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
            Welcome to Musa Residency. We're excited to have you!
          </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 24px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} Musa Residency. All rights reserved.
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
  return `Welcome to Musa Residency! 🎉

Hi ${name},

Congratulations! Your application to join Musa Residency has been approved. You're now part of our curated community of creative professionals who share their homes with fellow members.

Sign in to get started: ${loginUrl}

GETTING STARTED GUIDE
=====================

1. Complete your profile - Add more details about yourself and your creative work
2. List your home - Share your space with fellow community members
3. Browse listings - Discover amazing homes from other artists and creatives
4. Connect with members - Message other members to learn more about them

Welcome to Musa Residency. We're excited to have you!

© ${new Date().getFullYear()} Musa Residency. All rights reserved.
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
    subject: "Musa Residency Application Update",
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
  <title>Musa Residency Application Update</title>
</head>
<body style="background-color: #FAFAF9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
  <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px;">
        <!-- Logo/Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #2C5545; font-size: 28px; font-weight: 700; margin: 0;">Musa Residency</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0;">Creative Home Exchange Community</p>
        </div>

        <!-- Main Content -->
        <div>
          <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px;">Application Update</h2>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 16px;">
            Hi ${safeName},
          </p>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
            Thank you for your interest in joining the Musa Residency community. After careful review, we're unable to approve your application at this time.
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
            &copy; ${new Date().getFullYear()} Musa Residency. All rights reserved.
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

  return `Musa Residency Application Update

Hi ${name},

Thank you for your interest in joining the Musa Residency community. After careful review, we're unable to approve your application at this time.

FEEDBACK FROM OUR TEAM:
${feedback}
${refundText}
We appreciate your understanding. If you have any questions, please don't hesitate to reply to this email.

© ${new Date().getFullYear()} Musa Residency. All rights reserved.
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
    subject: "Musa Residency Application - Additional Information Needed",
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
  <title>Additional Information Needed - Musa Residency</title>
</head>
<body style="background-color: #FAFAF9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
  <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px;">
        <!-- Logo/Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #2C5545; font-size: 28px; font-weight: 700; margin: 0;">Musa Residency</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0;">Creative Home Exchange Community</p>
        </div>

        <!-- Main Content -->
        <div>
          <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px;">Additional Information Needed</h2>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 16px;">
            Hi ${safeName},
          </p>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
            Thank you for applying to Musa Residency! We're reviewing your application and need a bit more information before we can make a decision.
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
            &copy; ${new Date().getFullYear()} Musa Residency. All rights reserved.
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
  return `Additional Information Needed - Musa Residency

Hi ${name},

Thank you for applying to Musa Residency! We're reviewing your application and need a bit more information before we can make a decision.

WHAT WE NEED:
${requestedInfo}

Update your application here: ${updateUrl}

Once you've provided the information, we'll continue reviewing your application.

© ${new Date().getFullYear()} Musa Residency. All rights reserved.
`;
}

// =============================================================================
// Booking Emails (Stories 4-4, 4-10, 4-11)
// =============================================================================

/**
 * Send booking request notification to host
 */
export async function sendBookingRequestEmail({
  hostEmail,
  hostName,
  guestName,
  listingTitle,
  startDate,
  endDate,
  bookingType,
  reservationId,
}: {
  hostEmail: string;
  hostName: string | null;
  guestName: string | null;
  listingTitle: string;
  startDate: Date;
  endDate: Date;
  bookingType: "POINTS" | "SWAP";
  reservationId: string;
}): Promise<void> {
  if (!resend) {
    console.log("Resend not configured - skipping booking request email");
    return;
  }

  const safeHostName = hostName ?? "Host";
  const safeGuestName = guestName ?? "A member";
  const dateRange = `${startDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

  const { error } = await resend.emails.send({
    from: DEFAULT_FROM_EMAIL,
    to: hostEmail,
    subject: `New Booking Request - ${listingTitle}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #FAFAF9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
  <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #2C5545; font-size: 28px; font-weight: 700; margin: 0;">Musa Residency</h1>
        </div>
        <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px;">New Booking Request!</h2>
        <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
          Hi ${escapeHtml(safeHostName)}, ${escapeHtml(safeGuestName)} wants to stay at your listing.
        </p>
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px;"><strong>Listing:</strong> ${escapeHtml(listingTitle)}</p>
          <p style="margin: 0 0 8px;"><strong>Dates:</strong> ${dateRange}</p>
          <p style="margin: 0;"><strong>Type:</strong> ${bookingType === "POINTS" ? "Points Exchange" : "Home Swap"}</p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Sign in to Musa Residency to review and respond to this request.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`,
    text: `New Booking Request - Musa Residency

Hi ${safeHostName},

${safeGuestName} wants to stay at ${listingTitle}.

Dates: ${dateRange}
Type: ${bookingType === "POINTS" ? "Points Exchange" : "Home Swap"}

Sign in to Musa Residency to review and respond to this request.
`,
  });

  if (error) {
    console.error("Failed to send booking request email:", error);
  }
}

/**
 * Send booking confirmation email to both parties
 */
export async function sendBookingConfirmationEmail({
  guestEmail,
  guestName,
  hostEmail,
  hostName,
  listingTitle,
  location,
  startDate,
  endDate,
  bookingType,
  pointsCost,
}: {
  guestEmail: string;
  guestName: string | null;
  hostEmail: string;
  hostName: string | null;
  listingTitle: string;
  location: string;
  startDate: Date;
  endDate: Date;
  bookingType: "POINTS" | "SWAP";
  pointsCost: number | null;
}): Promise<void> {
  if (!resend) {
    console.log("Resend not configured - skipping confirmation emails");
    return;
  }

  const dateRange = `${startDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
  const safeGuestName = guestName ?? "Guest";
  const safeHostName = hostName ?? "Host";

  // Email to guest
  await resend.emails.send({
    from: DEFAULT_FROM_EMAIL,
    to: guestEmail,
    subject: `Booking Confirmed - ${listingTitle}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="background-color: #FAFAF9; font-family: 'Inter', sans-serif; margin: 0; padding: 40px 20px;">
  <table style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <tr><td style="padding: 40px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #2C5545; font-size: 28px; margin: 0;">Musa Residency</h1>
      </div>
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">🎉</span>
      </div>
      <h2 style="color: #1f2937; font-size: 24px; text-align: center; margin: 0 0 16px;">Booking Confirmed!</h2>
      <p style="color: #6b7280; font-size: 16px; text-align: center; margin: 0 0 24px;">
        Hi ${escapeHtml(safeGuestName)}, your stay is confirmed!
      </p>
      <div style="background: #dcfce7; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px;"><strong>${escapeHtml(listingTitle)}</strong></p>
        <p style="margin: 0 0 8px; color: #6b7280;">${escapeHtml(location)}</p>
        <p style="margin: 0;"><strong>Dates:</strong> ${dateRange}</p>
        ${pointsCost ? `<p style="margin: 8px 0 0;"><strong>Points:</strong> ${pointsCost} points</p>` : ""}
      </div>
      <p style="color: #6b7280; font-size: 14px;">Your host ${escapeHtml(safeHostName)} will be in touch with check-in details.</p>
    </td></tr>
  </table>
</body>
</html>
`,
    text: `Booking Confirmed! - Musa Residency

Hi ${safeGuestName},

Your stay is confirmed!

${listingTitle}
${location}
Dates: ${dateRange}
${pointsCost ? `Points: ${pointsCost}` : ""}

Your host ${safeHostName} will be in touch with check-in details.
`,
  });

  // Email to host
  await resend.emails.send({
    from: DEFAULT_FROM_EMAIL,
    to: hostEmail,
    subject: `Booking Confirmed - ${safeGuestName} is coming!`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="background-color: #FAFAF9; font-family: 'Inter', sans-serif; margin: 0; padding: 40px 20px;">
  <table style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <tr><td style="padding: 40px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #2C5545; font-size: 28px; margin: 0;">Musa Residency</h1>
      </div>
      <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px;">You have a guest coming!</h2>
      <p style="color: #6b7280; font-size: 16px; margin: 0 0 24px;">
        Hi ${escapeHtml(safeHostName)}, ${escapeHtml(safeGuestName)} has confirmed their stay at ${escapeHtml(listingTitle)}.
      </p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px;"><strong>Guest:</strong> ${escapeHtml(safeGuestName)}</p>
        <p style="margin: 0 0 8px;"><strong>Dates:</strong> ${dateRange}</p>
        <p style="margin: 0;"><strong>Type:</strong> ${bookingType === "POINTS" ? "Points Exchange" : "Home Swap"}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Please reach out to your guest with check-in instructions.</p>
    </td></tr>
  </table>
</body>
</html>
`,
    text: `You have a guest coming! - Musa Residency

Hi ${safeHostName},

${safeGuestName} has confirmed their stay at ${listingTitle}.

Guest: ${safeGuestName}
Dates: ${dateRange}
Type: ${bookingType === "POINTS" ? "Points Exchange" : "Home Swap"}

Please reach out to your guest with check-in instructions.
`,
  });
}

/**
 * Send booking declined email to guest
 */
export async function sendBookingDeclinedEmail({
  guestEmail,
  guestName,
  hostName,
  listingTitle,
  startDate,
  endDate,
  message,
}: {
  guestEmail: string;
  guestName: string | null;
  hostName: string | null;
  listingTitle: string;
  startDate: Date;
  endDate: Date;
  message?: string;
}): Promise<void> {
  if (!resend) {
    console.log("Resend not configured - skipping declined email");
    return;
  }

  const dateRange = `${startDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
  const safeGuestName = guestName ?? "there";
  const safeHostName = hostName ?? "The host";

  const { error } = await resend.emails.send({
    from: DEFAULT_FROM_EMAIL,
    to: guestEmail,
    subject: `Booking Request Update - ${listingTitle}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="background-color: #FAFAF9; font-family: 'Inter', sans-serif; margin: 0; padding: 40px 20px;">
  <table style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <tr><td style="padding: 40px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #2C5545; font-size: 28px; margin: 0;">Musa Residency</h1>
      </div>
      <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px;">Booking Request Declined</h2>
      <p style="color: #6b7280; font-size: 16px; margin: 0 0 24px;">
        Hi ${escapeHtml(safeGuestName)}, unfortunately your booking request for ${escapeHtml(listingTitle)} (${dateRange}) was not approved.
      </p>
      ${message ? `
      <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; font-weight: 600;">Message from ${escapeHtml(safeHostName)}:</p>
        <p style="margin: 0; color: #6b7280;">"${escapeHtml(message)}"</p>
      </div>
      ` : ""}
      <p style="color: #6b7280; font-size: 14px;">
        Don't worry - there are many other amazing homes to discover. Keep searching!
      </p>
    </td></tr>
  </table>
</body>
</html>
`,
    text: `Booking Request Declined - Musa Residency

Hi ${safeGuestName},

Unfortunately your booking request for ${listingTitle} (${dateRange}) was not approved.

${message ? `Message from ${safeHostName}: "${message}"` : ""}

Don't worry - there are many other amazing homes to discover. Keep searching!
`,
  });

  if (error) {
    console.error("Failed to send declined email:", error);
  }
}

// =============================================================================
// Donation Emails
// =============================================================================

/**
 * Send notification to fund creator when they receive a donation
 */
export async function sendDonationReceivedEmail({
  creatorEmail,
  creatorName,
  donorName,
  fundTitle,
  amount,
  message,
  isAnonymous,
}: {
  creatorEmail: string;
  creatorName: string | null;
  donorName: string | null;
  fundTitle: string;
  amount: number; // in cents
  message?: string | null;
  isAnonymous: boolean;
}): Promise<void> {
  if (!resend) {
    console.log("Resend not configured - skipping donation received email");
    return;
  }

  const safeCreatorName = creatorName ?? "there";
  const displayDonorName = isAnonymous ? "Anonymous" : (donorName ?? "A supporter");
  const amountFormatted = `$${(amount / 100).toFixed(0)}`;

  const { error } = await resend.emails.send({
    from: DEFAULT_FROM_EMAIL,
    to: creatorEmail,
    subject: `New Donation to "${fundTitle}"`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="background-color: #FAFAF9; font-family: 'Inter', sans-serif; margin: 0; padding: 40px 20px;">
  <table style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <tr><td style="padding: 40px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #2C5545; font-size: 28px; margin: 0;">Musa Residency</h1>
      </div>
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">💝</span>
      </div>
      <h2 style="color: #1f2937; font-size: 24px; text-align: center; margin: 0 0 16px;">You received a donation!</h2>
      <p style="color: #6b7280; font-size: 16px; text-align: center; margin: 0 0 24px;">
        Hi ${escapeHtml(safeCreatorName)}, ${escapeHtml(displayDonorName)} just donated to your campaign.
      </p>
      <div style="background: #dcfce7; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; font-size: 14px; color: #166534;">Amount</p>
        <p style="margin: 0; font-size: 32px; font-weight: bold; color: #166534;">${amountFormatted}</p>
      </div>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px;"><strong>Campaign:</strong> ${escapeHtml(fundTitle)}</p>
        <p style="margin: 0 0 8px;"><strong>From:</strong> ${escapeHtml(displayDonorName)}</p>
        ${message ? `<p style="margin: 8px 0 0; font-style: italic; color: #6b7280;">"${escapeHtml(message)}"</p>` : ""}
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        Note: A 10% platform fee has been deducted. Payouts are processed manually by our team.
      </p>
    </td></tr>
  </table>
</body>
</html>
`,
    text: `You received a donation! - Musa Residency

Hi ${safeCreatorName},

${displayDonorName} just donated ${amountFormatted} to your campaign "${fundTitle}".

${message ? `Message: "${message}"` : ""}

Note: A 10% platform fee has been deducted. Payouts are processed manually by our team.
`,
  });

  if (error) {
    console.error("Failed to send donation received email:", error);
  }
}

/**
 * Send receipt to donor after successful donation
 */
export async function sendDonationReceiptEmail({
  donorEmail,
  donorName,
  fundTitle,
  creatorName,
  amount,
}: {
  donorEmail: string;
  donorName: string | null;
  fundTitle: string;
  creatorName: string | null;
  amount: number; // in cents
}): Promise<void> {
  if (!resend) {
    console.log("Resend not configured - skipping donation receipt email");
    return;
  }

  const safeDonorName = donorName ?? "there";
  const safeCreatorName = creatorName ?? "the campaign creator";
  const amountFormatted = `$${(amount / 100).toFixed(0)}`;
  const platformFee = `$${((amount * 0.1) / 100).toFixed(2)}`;
  const creatorReceives = `$${((amount * 0.9) / 100).toFixed(2)}`;

  const { error } = await resend.emails.send({
    from: DEFAULT_FROM_EMAIL,
    to: donorEmail,
    subject: `Thank you for your donation to "${fundTitle}"`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="background-color: #FAFAF9; font-family: 'Inter', sans-serif; margin: 0; padding: 40px 20px;">
  <table style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <tr><td style="padding: 40px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #2C5545; font-size: 28px; margin: 0;">Musa Residency</h1>
      </div>
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">🙏</span>
      </div>
      <h2 style="color: #1f2937; font-size: 24px; text-align: center; margin: 0 0 16px;">Thank you for your support!</h2>
      <p style="color: #6b7280; font-size: 16px; text-align: center; margin: 0 0 24px;">
        Hi ${escapeHtml(safeDonorName)}, your donation has been received.
      </p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 12px;"><strong>Campaign:</strong> ${escapeHtml(fundTitle)}</p>
        <p style="margin: 0 0 12px;"><strong>Creator:</strong> ${escapeHtml(safeCreatorName)}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;">
        <p style="margin: 0 0 8px;"><strong>Your donation:</strong> ${amountFormatted}</p>
        <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Platform fee (10%): ${platformFee}</p>
        <p style="margin: 0; color: #166534;"><strong>Creator receives:</strong> ${creatorReceives}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px; text-align: center;">
        Thank you for supporting artists in our community!
      </p>
    </td></tr>
  </table>
</body>
</html>
`,
    text: `Thank you for your donation! - Musa Residency

Hi ${safeDonorName},

Your donation to "${fundTitle}" by ${safeCreatorName} has been received.

Your donation: ${amountFormatted}
Platform fee (10%): ${platformFee}
Creator receives: ${creatorReceives}

Thank you for supporting artists in our community!
`,
  });

  if (error) {
    console.error("Failed to send donation receipt email:", error);
  }
}
