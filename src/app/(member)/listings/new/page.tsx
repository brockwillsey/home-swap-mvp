import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { MemberHeader } from "~/components/layout/MemberHeader";
import { ListingForm } from "~/components/forms/ListingForm";

/**
 * New Listing Page
 *
 * Allows approved members to create a new home listing.
 */
export default async function NewListingPage() {
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/listings/new");
  }

  // Get user with application data
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      application: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // Check if user is approved
  const isApproved = user.application?.status === "APPROVED";

  // Redirect non-approved users
  if (!isApproved) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader userName={user.name} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Add a Home</h1>
          <p className="mt-2 text-muted-foreground">
            Share your home with the Musa Residency community
          </p>
        </div>

        <ListingForm />
      </div>
    </main>
  );
}
