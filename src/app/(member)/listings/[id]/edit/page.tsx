import Link from "next/link";
import { redirect, notFound } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { MemberHeader } from "~/components/layout/MemberHeader";
import { ListingForm } from "~/components/forms/ListingForm";
import { Button } from "~/components/ui/button";

/**
 * Edit Listing Page
 *
 * Allows members to edit their existing home listing details.
 */
export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/listings/" + id + "/edit");
  }

  // Get the listing
  const listing = await db.home.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      ownerId: true,
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

      {/* Main Content */}
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
          <h1 className="text-3xl font-bold text-foreground">Edit Listing</h1>
          <p className="mt-2 text-muted-foreground">
            Update your listing details
          </p>
        </div>

        <ListingForm
          mode="edit"
          listing={{
            id: listing.id,
            title: listing.title,
            description: listing.description ?? "",
            location: listing.location,
          }}
        />
      </div>
    </main>
  );
}
