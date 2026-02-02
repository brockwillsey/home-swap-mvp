/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for subscription processing.
 * Events handled:
 * - checkout.session.completed: Update application status to SUBMITTED (for subscriptions)
 * - customer.subscription.deleted: Handle subscription cancellations
 *
 * Security:
 * - Verifies webhook signature to prevent spoofed events
 * - Uses raw body for signature verification
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe, getStripeWebhookSecret } from "~/lib/services/stripe";
import { db } from "~/server/db";
import { sendApplicationConfirmationEmail, sendNewApplicationNotificationEmail, sendDonationReceivedEmail, sendDonationReceiptEmail } from "~/lib/services/resend";
import { env } from "~/env";

export async function POST(req: Request) {
  // Get webhook secret - returns null if not configured
  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    console.error("Stripe webhook secret is not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("No stripe-signature header found");
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", errorMessage);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Route based on metadata type
        if (session.metadata?.type === "donation") {
          await handleDonationCheckoutCompleted(session);
        } else {
          await handleCheckoutSessionCompleted(session);
        }
        break;
      }
      case "charge.refunded": {
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      }
      default:
        // Log unhandled events for debugging but don't fail
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error handling Stripe event ${event.type}:`, error);
    // Return 200 to acknowledge receipt - Stripe will retry on 5xx
    // We log the error and can investigate later
    return NextResponse.json({ received: true, error: "Processing error" });
  }
}

/**
 * Handle successful checkout session completion
 * Updates application status and sends confirmation email
 * Supports both one-time payments and subscriptions
 * Idempotent: skips if already processed to prevent duplicate emails on webhook retry
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const applicationId = session.metadata?.applicationId;
  const userId = session.metadata?.userId;

  if (!applicationId) {
    console.error("Checkout session missing applicationId in metadata", {
      sessionId: session.id,
    });
    return;
  }

  // Check if already processed (idempotency)
  const existingApplication = await db.application.findUnique({
    where: { id: applicationId },
    select: { status: true, stripePaymentId: true, stripeSubscriptionId: true },
  });

  if (!existingApplication) {
    console.error(`Application ${applicationId} not found`);
    return;
  }

  // Skip if already SUBMITTED or APPROVED (already processed)
  if (existingApplication.status === "SUBMITTED" || existingApplication.status === "APPROVED") {
    console.log(`Application ${applicationId} already processed (status: ${existingApplication.status}), skipping`);
    return;
  }

  // Get subscription ID for subscription mode, or payment intent for one-time
  const subscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id ?? null;

  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id ?? null;

  // Update application status to APPROVED (auto-approve after payment)
  // TODO: Change back to SUBMITTED when admin review is required
  const application = await db.application.update({
    where: { id: applicationId },
    data: {
      status: "APPROVED",
      stripeSubscriptionId: subscriptionId,
      stripePaymentId: paymentIntentId,
      reviewedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  // Sync application profile data to user record
  await db.user.update({
    where: { id: application.user.id },
    data: {
      bio: application.bio,
      location: application.location,
      creativeInterests: application.roles,
      image: application.profilePhotoUrl,
    },
  });

  console.log(`Application ${applicationId} auto-approved after payment`, {
    userId,
    subscriptionId,
    paymentIntent: session.payment_intent,
  });

  // Send confirmation email to applicant
  if (application.user.email) {
    try {
      await sendApplicationConfirmationEmail({
        email: application.user.email,
        name: application.user.name ?? "Applicant",
      });
      console.log(`Confirmation email sent to ${application.user.email}`);
    } catch (emailError) {
      // Log email error but don't fail the webhook
      console.error("Failed to send confirmation email:", emailError);
    }
  }

  // Send notification email to admin
  if (env.ADMIN_EMAIL) {
    try {
      await sendNewApplicationNotificationEmail({
        adminEmail: env.ADMIN_EMAIL,
        applicantName: application.user.name ?? "Unknown",
        applicantEmail: application.user.email ?? "Unknown",
        location: application.location,
        roles: application.roles,
        applicationId: application.id,
      });
      console.log(`Admin notification sent to ${env.ADMIN_EMAIL}`);
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
    }
  }
}

/**
 * Handle donation checkout session completion
 * Updates donation status and increments fund amount
 */
async function handleDonationCheckoutCompleted(session: Stripe.Checkout.Session) {
  const donationId = session.metadata?.donationId;
  const fundId = session.metadata?.fundId;

  if (!donationId || !fundId) {
    console.error("Donation checkout session missing required metadata", {
      sessionId: session.id,
      donationId,
      fundId,
    });
    return;
  }

  // Get donation record with related data for emails
  const donation = await db.donation.findUnique({
    where: { id: donationId },
    include: {
      fund: {
        select: {
          id: true,
          title: true,
          creator: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
      donor: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!donation) {
    console.error(`Donation ${donationId} not found`);
    return;
  }

  // Check if already processed (idempotency)
  if (donation.status === "COMPLETED") {
    console.log(`Donation ${donationId} already completed, skipping`);
    return;
  }

  // Get payment intent ID
  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id ?? null;

  // Update donation to COMPLETED
  await db.donation.update({
    where: { id: donationId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      stripePaymentIntentId: paymentIntentId,
    },
  });

  // Increment fund's current amount
  await db.fund.update({
    where: { id: fundId },
    data: {
      currentAmount: {
        increment: donation.amount,
      },
    },
  });

  console.log(`Donation ${donationId} completed`, {
    fundId,
    amount: donation.amount,
    platformFee: donation.platformFee,
  });

  // Send email notifications
  if (donation.fund.creator.email) {
    try {
      await sendDonationReceivedEmail({
        creatorEmail: donation.fund.creator.email,
        creatorName: donation.fund.creator.name,
        donorName: donation.donor?.name ?? null,
        fundTitle: donation.fund.title,
        amount: donation.amount,
        message: donation.message,
        isAnonymous: donation.isAnonymous,
      });
      console.log(`Donation received email sent to ${donation.fund.creator.email}`);
    } catch (emailError) {
      console.error("Failed to send donation received email:", emailError);
    }
  }

  if (donation.donor?.email) {
    try {
      await sendDonationReceiptEmail({
        donorEmail: donation.donor.email,
        donorName: donation.donor.name,
        fundTitle: donation.fund.title,
        creatorName: donation.fund.creator.name,
        amount: donation.amount,
      });
      console.log(`Donation receipt email sent to ${donation.donor.email}`);
    } catch (emailError) {
      console.error("Failed to send donation receipt email:", emailError);
    }
  }
}

/**
 * Handle charge refund events
 * This is triggered when an admin rejects a paid application
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = typeof charge.payment_intent === "string"
    ? charge.payment_intent
    : charge.payment_intent?.id;

  if (!paymentIntentId) {
    console.log("Charge refund event without payment_intent - skipping");
    return;
  }

  // Find application by payment intent ID
  const application = await db.application.findFirst({
    where: { stripePaymentId: paymentIntentId },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!application) {
    console.log(`No application found for payment intent ${paymentIntentId}`);
    return;
  }

  console.log(`Refund processed for application ${application.id}`, {
    userId: application.userId,
    status: application.status,
    refundAmount: charge.amount_refunded,
  });

  // Note: The application status should already be REJECTED by the admin
  // This webhook just confirms the refund was processed
}
