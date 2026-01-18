/**
 * Stripe Service Configuration
 *
 * Provides Stripe client and utilities for payment processing.
 * Uses Stripe Checkout for PCI-compliant payment handling.
 *
 * Setup Instructions:
 * 1. Create account at https://stripe.com
 * 2. Get API keys from Dashboard → Developers → API keys
 * 3. Create a Product: "Art Res Annual Membership"
 * 4. Create a Price: $300.00 one-time payment
 * 5. Configure webhook endpoint: /api/webhooks/stripe
 *    - Events: checkout.session.completed, charge.refunded
 * 6. Set environment variables in .env:
 *    - STRIPE_SECRET_KEY (server-side)
 *    - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (client-side)
 *    - STRIPE_WEBHOOK_SECRET (webhook verification)
 *    - STRIPE_PRICE_ID (price ID for membership)
 *
 * Test Mode:
 * - Use test API keys during development (sk_test_*, pk_test_*)
 * - Test card: 4242 4242 4242 4242, any future date, any CVC
 * - Decline test: 4000 0000 0000 0002
 */

import Stripe from "stripe";
import { env } from "~/env";

/**
 * Stripe server-side client
 * Used for creating checkout sessions, handling webhooks, and refunds
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

/**
 * Check if Stripe is properly configured for server-side operations
 */
export function isStripeConfigured(): boolean {
  return !!env.STRIPE_SECRET_KEY;
}

/**
 * Check if Stripe webhook is configured and return the secret
 * Returns the secret if configured, null otherwise
 * This avoids non-null assertions in webhook handlers
 */
export function getStripeWebhookSecret(): string | null {
  return env.STRIPE_WEBHOOK_SECRET ?? null;
}

/**
 * Membership price in cents ($300.00)
 */
export const MEMBERSHIP_PRICE_CENTS = 30000;

/**
 * Membership description for Stripe checkout
 */
export const MEMBERSHIP_DESCRIPTION = "Art Res Annual Membership";

/**
 * Get the Stripe Price ID from environment
 * Falls back to creating a line item if no price ID is configured
 */
export function getStripePriceId(): string | undefined {
  return env.STRIPE_PRICE_ID;
}

/**
 * Create a refund for a payment
 * Used when admin rejects a paid application
 *
 * @param paymentIntentId - The Stripe payment intent ID to refund
 * @param reason - Optional reason for the refund
 * @returns The refund object if successful
 */
export async function createRefund(
  paymentIntentId: string,
  reason?: "duplicate" | "fraudulent" | "requested_by_customer"
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  if (!isStripeConfigured()) {
    return { success: false, error: "Stripe is not configured" };
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason ?? "requested_by_customer",
    });

    return {
      success: true,
      refundId: refund.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to create refund:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
