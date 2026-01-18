import Link from "next/link";
import { redirect, notFound } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { MemberHeader } from "~/components/layout/MemberHeader";
import { ListingPhotosForm } from "~/components/forms/ListingPhotosForm";
import { Button } from "~/components/ui/button";

/**
 * Listing Photos Page
 *
 * Allows members to upload and manage photos for their listing.
 * Photos are stored in Cloudinary and URLs saved to the database.
 */
export default async function ListingPhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/listings/" + id + "/photos");
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

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader userName={user?.name} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb / Back link */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/dashboard">
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
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Add Photos</h1>
          <p className="mt-2 text-muted-foreground">
            Add photos of {listing.title}
          </p>
        </div>

        <ListingPhotosForm
          listingId={listing.id}
          listingTitle={listing.title}
          initialPhotos={listing.photos}
        />
      </div>
    </main>
  );
}
