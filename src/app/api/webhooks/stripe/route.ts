/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for payment processing.
 * Events handled:
 * - checkout.session.completed: Update application status to SUBMITTED
 * - charge.refunded: Handle refund events for rejected applications
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
import { sendApplicationConfirmationEmail } from "~/lib/services/resend";

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
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
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
    select: { status: true, stripePaymentId: true },
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

  // Update application status to SUBMITTED
  const application = await db.application.update({
    where: { id: applicationId },
    data: {
      status: "SUBMITTED",
      stripePaymentId: typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  console.log(`Application ${applicationId} status updated to SUBMITTED`, {
    userId,
    paymentIntent: session.payment_intent,
  });

  // Send confirmation email
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
