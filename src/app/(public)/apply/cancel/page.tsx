import { Suspense } from "react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

/**
 * Payment Cancelled Page
 *
 * Shown when user cancels payment on Stripe checkout.
 * Application remains in PENDING status - user can retry payment.
 */
function CancelContent() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        {/* Warning icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
          <svg
            className="h-8 w-8 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
        <CardDescription className="mt-2">
          Your payment was not completed.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status message */}
        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <p>
            No charges have been made to your card. Your application is still saved
            and you can complete the payment whenever you&apos;re ready.
          </p>
        </div>

        {/* Help message */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Having trouble with payment? Make sure your card details are correct
            or try a different payment method.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/apply/payment">Return to Payment</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        {/* Support note */}
        <p className="text-center text-xs text-muted-foreground">
          Need help? Contact us at{" "}
          <a href="mailto:support@artres.com" className="text-primary hover:underline">
            support@artres.com
          </a>
        </p>
      </CardContent>
    </Card>
  );
}

export default function ApplyCancelPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Art Res Branding */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-4xl font-bold text-primary">Art Res</h1>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        }
      >
        <CancelContent />
      </Suspense>
    </main>
  );
}
