import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { PaymentContent } from "./PaymentContent";

/**
 * Payment Page
 *
 * Displayed after application form submission.
 * Requires user to be signed in with a PENDING application.
 */
export default async function PaymentPage() {
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/apply/payment");
  }

  // Check application status
  const application = await db.application.findUnique({
    where: { userId: session.user.id },
  });

  // If no application, redirect to apply page
  if (!application) {
    redirect("/apply");
  }

  // If already paid/submitted, redirect to success
  if (application.status === "SUBMITTED" || application.status === "APPROVED") {
    redirect("/apply/success");
  }

  // If rejected, redirect to apply page with message
  if (application.status === "REJECTED") {
    redirect("/apply?status=rejected");
  }

  // If needs info, redirect to apply page to update application
  if (application.status === "NEEDS_INFO") {
    redirect("/apply?status=needs-info");
  }

  // Check if user has valid promo code for 6-month trial
  const hasPromoCode = application.promoCode?.toUpperCase() === "MUSA-RES-6";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Art Res Branding */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-4xl font-bold text-primary">Art Res</h1>
        </Link>
        <p className="mt-2 text-muted-foreground">
          Complete your membership
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex h-64 w-full max-w-md items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }
      >
        <PaymentContent
          userEmail={session.user.email ?? undefined}
          membershipFee={application.membershipFee}
          hasPromoCode={hasPromoCode}
        />
      </Suspense>

      {/* Back link */}
      <div className="mt-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to home
        </Link>
      </div>
    </main>
  );
}
