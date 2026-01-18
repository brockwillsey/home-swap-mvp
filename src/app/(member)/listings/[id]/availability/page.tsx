import Link from "next/link";
import { redirect, notFound } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { MemberHeader } from "~/components/layout/MemberHeader";
import { AvailabilityCalendar } from "~/components/forms/AvailabilityCalendar";
import { Button } from "~/components/ui/button";

/**
 * Listing Availability Page
 *
 * Allows members to manage availability dates for their listing.
 */
export default async function ListingAvailabilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/listings/" + id + "/availability");
  }

  // Get the listing with availability
  const listing = await db.home.findUnique({
    where: { id },
    include: {
      availability: {
        orderBy: { startDate: "asc" },
      },
    },
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
              Back to Photos
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Availability</h1>
          <p className="mt-2 text-muted-foreground">
            Set when {listing.title} is available for guests
          </p>
        </div>

        <div className="max-w-2xl">
          <AvailabilityCalendar
            listingId={listing.id}
            initialAvailability={listing.availability}
          />
        </div>
      </div>
    </main>
  );
}
