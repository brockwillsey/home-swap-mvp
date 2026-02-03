/**
 * Donation tRPC Router
 *
 * Handles donation creation and checkout session management.
 * Uses Stripe for secure payment processing.
 */

import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure, rateLimitedProtectedProcedure } from "~/server/api/trpc";
import { donationInputSchema } from "~/lib/validations/fund";
import { stripe, isStripeConfigured } from "~/lib/services/stripe";

/**
 * Platform fee percentage (10%)
 */
const PLATFORM_FEE_PERCENT = 10;

export const donationRouter = createTRPCRouter({
  /**
   * Create a Stripe checkout session for a donation
   * Rate limited to prevent abuse
   */
  createCheckoutSession: rateLimitedProtectedProcedure
    .input(donationInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!isStripeConfigured()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Payment system is not configured. Please contact support.",
        });
      }

      const { fundId, amount, message, isAnonymous } = input;

      // Verify fund exists and is active
      const fund = await ctx.db.fund.findUnique({
        where: { id: fundId },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!fund) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fund not found",
        });
      }

      if (fund.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This fund is not accepting donations at this time",
        });
      }

      // Calculate platform fee (10%)
      const platformFee = Math.round(amount * PLATFORM_FEE_PERCENT / 100);

      // Create pending donation record
      const donation = await ctx.db.donation.create({
        data: {
          fundId,
          donorId: ctx.session.user.id,
          amount,
          platformFee,
          message: message?.trim(),
          isAnonymous,
          status: "PENDING",
        },
      });

      // Build URLs for redirect
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXTAUTH_URL ?? "http://localhost:3000";

      const successUrl = `${baseUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}&fund_id=${fundId}`;
      const cancelUrl = `${baseUrl}/funds/${fundId}`;

      try {
        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Donation to "${fund.title}"`,
                  description: `Support ${fund.creator.name ?? "this artist"}'s creative project. 10% platform fee helps maintain Musa Residency.`,
                },
                unit_amount: amount,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: ctx.session.user.email ?? undefined,
          metadata: {
            type: "donation",
            donationId: donation.id,
            fundId,
            donorId: ctx.session.user.id,
            isAnonymous: isAnonymous.toString(),
          },
        });

        // Update donation with payment intent ID
        if (session.payment_intent) {
          const paymentIntentId = typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent.id;

          await ctx.db.donation.update({
            where: { id: donation.id },
            data: { stripePaymentIntentId: paymentIntentId },
          });
        }

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        // Clean up pending donation if Stripe fails
        await ctx.db.donation.delete({
          where: { id: donation.id },
        });

        console.error("Failed to create Stripe checkout session:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create payment session. Please try again.",
        });
      }
    }),

  /**
   * Get the current user's donation history
   */
  getMyDonations: protectedProcedure.query(async ({ ctx }) => {
    const donations = await ctx.db.donation.findMany({
      where: {
        donorId: ctx.session.user.id,
        status: "COMPLETED",
      },
      orderBy: { completedAt: "desc" },
      include: {
        fund: {
          select: {
            id: true,
            title: true,
            creator: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return donations;
  }),
});
