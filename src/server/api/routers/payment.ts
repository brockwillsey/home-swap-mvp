/**
 * Payment tRPC Router
 *
 * Handles Stripe checkout session creation for membership subscriptions.
 * Requires authentication - user must have a pending application.
 *
 * Subscription model:
 * - Yearly billing cycle
 * - Promo code MUSA-RES-6 provides 6-month free trial
 * - Auto-renews at end of period
 */

// Valid promo code for 6-month free trial
const VALID_PROMO_CODE = "MUSA-RES-6";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, rateLimitedProtectedProcedure } from "~/server/api/trpc";
import { stripe, isStripeConfigured, MEMBERSHIP_DESCRIPTION } from "~/lib/services/stripe";
import { env } from "~/env";
import { calculateMembershipFee, type MembershipRoleType } from "~/lib/validations/application";

export const paymentRouter = createTRPCRouter({
  /**
   * Create a Stripe Checkout session for membership payment
   *
   * Flow:
   * 1. Verify user is authenticated
   * 2. Verify user has an application in PENDING status
   * 3. Create Stripe Checkout session with application metadata
   * 4. Return session ID for client-side redirect
   *
   * Security:
   * - Protected procedure (requires authentication)
   * - Validates application status before allowing payment
   * - Includes application ID in metadata for webhook reconciliation
   */
  createCheckoutSession: rateLimitedProtectedProcedure.mutation(async ({ ctx }) => {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Payment system is not configured. Please contact support.",
      });
    }

    // Get user's application
    const application = await ctx.db.application.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!application) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No application found. Please complete your application first.",
      });
    }

    // Only allow payment for PENDING applications
    if (application.status !== "PENDING") {
      if (application.status === "SUBMITTED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment has already been completed for this application.",
        });
      }
      if (application.status === "APPROVED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Your application has already been approved. Welcome to Art Res!",
        });
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot process payment for this application status.",
      });
    }

    // Build URLs for redirect
    // Use VERCEL_URL in production, localhost in development
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const successUrl = `${baseUrl}/apply/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/apply/cancel`;

    // Calculate price based on roles
    const roles = JSON.parse(application.roles) as string[];
    const membershipFee = calculateMembershipFee(roles as MembershipRoleType[]);
    const priceInCents = membershipFee * 100; // Convert dollars to cents

    // Check if user has the valid promo code for 6-month free trial
    const hasPromoCode = application.promoCode?.toUpperCase() === VALID_PROMO_CODE;

    // Calculate trial end date (6 months from now) if promo code is valid
    const trialEndDate = hasPromoCode
      ? Math.floor(Date.now() / 1000) + (6 * 30 * 24 * 60 * 60) // ~6 months in seconds
      : undefined;

    try {
      // Create Stripe Checkout session with subscription mode
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: MEMBERSHIP_DESCRIPTION,
                description: hasPromoCode
                  ? "Enjoy 6 months of membership on us! Your yearly Musa Residency membership will renew 6 months from today."
                  : "Yearly membership to the Musa Residency community. Auto-renews annually.",
              },
              unit_amount: priceInCents,
              recurring: {
                interval: "year",
                interval_count: 1, // Bill yearly
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: ctx.session.user.email ?? undefined,
        metadata: {
          applicationId: application.id,
          userId: ctx.session.user.id,
          promoCode: application.promoCode ?? "",
        },
        subscription_data: {
          metadata: {
            applicationId: application.id,
            userId: ctx.session.user.id,
          },
          // Add 6-month trial if promo code is valid
          ...(trialEndDate && { trial_end: trialEndDate }),
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error("Failed to create Stripe checkout session:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create payment session. Please try again.",
      });
    }
  }),

  /**
   * Get application payment status
   * Useful for checking if payment is needed or already completed
   */
  getPaymentStatus: protectedProcedure.query(async ({ ctx }) => {
    const application = await ctx.db.application.findUnique({
      where: { userId: ctx.session.user.id },
      select: {
        status: true,
        stripePaymentId: true,
        createdAt: true,
      },
    });

    if (!application) {
      return {
        hasApplication: false,
        needsPayment: false,
        isPaid: false,
      };
    }

    return {
      hasApplication: true,
      needsPayment: application.status === "PENDING",
      isPaid: !!application.stripePaymentId,
      status: application.status,
    };
  }),
});
