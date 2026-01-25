import Link from "next/link";
import { redirect, notFound } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { MemberHeader } from "~/components/layout/MemberHeader";
import { ListingSettingsForm } from "~/components/forms/ListingSettingsForm";
import { Button } from "~/components/ui/button";

/**
 * Listing Settings Page
 *
 * Allows members to configure booking mode and exchange type preferences.
 * Stories 2-6 and 2-7.
 */
export default async function ListingSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/listings/" + id + "/settings");
  }

  // Get the listing
  const listing = await db.home.findUnique({
    where: { id },
  });

  if (!listing) {
    notFound();
  }

  // Verify ownership
  if (listing.ownerId !== session.user.id) {
    redirect("/dashboard");
  }

  // Get user for header
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  // Parse preferredDestinations from JSON string
  const preferredDestinations = JSON.parse(listing.preferredDestinations) as string[];

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader userName={user?.name} />

      <div className="container mx-auto px-4 py-8">
        {/* Back link */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href={`/listings/${id}/photos`}>
              <svg
                className="mr-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Listing
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Configure booking preferences for {listing.title}
          </p>
        </div>

        <div className="max-w-2xl">
          <ListingSettingsForm
            listingId={listing.id}
            initialBookingMode={listing.bookingMode}
            initialExchangeType={listing.exchangeType}
            initialPreferredDestinations={preferredDestinations}
          />
        </div>
      </div>
    </main>
  );
}
