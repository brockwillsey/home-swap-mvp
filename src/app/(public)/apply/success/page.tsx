import { Suspense } from "react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { RefreshButton } from "./RefreshButton";

/**
 * Application Success Page
 *
 * Shown after successful application submission.
 * - For paid applications (artists/home owners): After payment confirmation
 * - For free applications (sponsors): Immediately after form submission
 * Verifies application status server-side to prevent false success display.
 */

/**
 * Server component that fetches application status
 */
async function SuccessContentServer() {
  const session = await auth();

  // Check if user is authenticated and has an application
  let applicationData: { isPaid: boolean; membershipFee: number; isSponsorOnly: boolean } | null = null;

  if (session?.user?.id) {
    const application = await db.application.findUnique({
      where: { userId: session.user.id },
      select: { status: true, stripePaymentId: true, membershipFee: true, roles: true },
    });

    if (application) {
      const isSponsorOnly = application.membershipFee === 0;
      // Consider paid if:
      // - It's a free sponsor application (no payment needed), OR
      // - Has stripePaymentId, OR
      // - Status is SUBMITTED or APPROVED
      const isPaid = !!(
        isSponsorOnly ||
        application.stripePaymentId ||
        application.status === "SUBMITTED" ||
        application.status === "APPROVED"
      );

      applicationData = {
        isPaid,
        membershipFee: application.membershipFee,
        isSponsorOnly,
      };
    }
  }

  // If no application found, check for sponsor submission without session
  // (sponsors might not have signed in yet)
  if (!applicationData) {
    // Show a generic success for sponsors who submitted without signing in
    return <SuccessContent isPaid={true} membershipFee={0} isSponsorOnly={true} />;
  }

  return (
    <SuccessContent
      isPaid={applicationData.isPaid}
      membershipFee={applicationData.membershipFee}
      isSponsorOnly={applicationData.isSponsorOnly}
    />
  );
}

function SuccessContent({
  isPaid,
  membershipFee,
  isSponsorOnly,
}: {
  isPaid: boolean;
  membershipFee: number;
  isSponsorOnly: boolean;
}) {
  // If not paid and requires payment, show processing message
  if (!isPaid && membershipFee > 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
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
          <CardTitle className="text-2xl">Payment Processing</CardTitle>
          <CardDescription className="mt-2">
            We&apos;re confirming your payment with Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p>
              Your payment is being processed. This usually takes just a few seconds.
              Please refresh this page in a moment, or check your email for confirmation.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <RefreshButton />
            <Button variant="outline" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success view - for both paid applications and free sponsor applications
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        {/* Success icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <CardTitle className="text-2xl">Application Submitted!</CardTitle>
        <CardDescription className="mt-2">
          Thank you for applying to join Art Res.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Payment/Free confirmation */}
        {isSponsorOnly ? (
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-center">
            <p className="font-medium text-green-700">Sponsor Application Received</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Thank you for wanting to support our artist community!
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-center">
            <p className="font-medium text-green-700">Payment Successful</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your ${membershipFee} membership fee has been received
            </p>
          </div>
        )}

        {/* Status message */}
        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">
            What happens next:
          </p>
          <ol className="list-inside list-decimal space-y-2">
            <li>Our team will review your application within 3-5 business days</li>
            {!isSponsorOnly && (
              <li>We&apos;ll check your profile, photos, and background</li>
            )}
            <li>You&apos;ll receive an email with our decision</li>
            <li>
              {isSponsorOnly
                ? "If approved, you can start supporting artists immediately"
                : "If approved, you can start using Art Res immediately"}
            </li>
          </ol>
        </div>

        {/* Refund note - only for paid applications */}
        {!isSponsorOnly && (
          <p className="text-center text-xs text-muted-foreground">
            If your application is not approved, you&apos;ll receive a full refund automatically.
          </p>
        )}

        {/* Confirmation email note */}
        <div className="rounded-lg bg-primary/5 p-4 text-center text-sm">
          <p className="text-muted-foreground">
            A confirmation email has been sent to your inbox.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/signin">Sign in to check status</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApplySuccessPage() {
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
        <SuccessContentServer />
      </Suspense>
    </main>
  );
}
