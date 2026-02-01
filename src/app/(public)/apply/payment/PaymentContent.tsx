"use client";

import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { env } from "~/env";

// Check if Stripe is configured
const isStripeConfigured = !!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

interface PaymentContentProps {
  userEmail?: string;
  membershipFee?: number;
}

/**
 * Payment page client content
 * Handles Stripe checkout session creation and redirect for subscriptions
 */
export function PaymentContent({ userEmail, membershipFee = 300 }: PaymentContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = api.payment.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe Checkout using the URL returned from API
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Failed to create checkout session. Please try again.");
        setIsLoading(false);
      }
    },
    onError: (err) => {
      setError(err.message);
      setIsLoading(false);
    },
  });

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    createCheckoutSession.mutate();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Complete Your Application</CardTitle>
        <CardDescription className="mt-2">
          Final step: Set up your membership subscription
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="rounded-lg bg-muted p-4">
          <h3 className="font-semibold text-foreground">Order Summary</h3>
          <div className="mt-3 flex items-center justify-between border-t pt-3">
            <span className="text-muted-foreground">Art Res Membership</span>
            <span className="font-bold text-foreground">${membershipFee}.00 / 6 months</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Billed every 6 months. Cancel anytime. Have a promo code? Enter it at checkout.
          </p>
        </div>

        {/* What's included */}
        <div className="space-y-2 text-sm">
          <p className="font-medium">Membership includes:</p>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>Access to the Art Res home exchange network</li>
            <li>Create unlimited home listings</li>
            <li>Connect with fellow creatives worldwide</li>
            <li>Points-based and swap exchanges</li>
          </ul>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={isLoading || !isStripeConfigured}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing...
            </>
          ) : (
            "Proceed to Payment"
          )}
        </Button>

        {!isStripeConfigured && (
          <p className="text-center text-sm text-muted-foreground">
            Payment system is being configured. Please try again later.
          </p>
        )}

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Secure payment powered by Stripe</span>
        </div>

        {/* Contact email */}
        {userEmail && (
          <p className="text-center text-xs text-muted-foreground">
            Confirmation will be sent to: {userEmail}
          </p>
        )}

        {/* Subscription note */}
        <p className="text-center text-xs text-muted-foreground">
          Your subscription will auto-renew every 6 months. Cancel anytime from your account settings.
        </p>
      </CardContent>
    </Card>
  );
}
