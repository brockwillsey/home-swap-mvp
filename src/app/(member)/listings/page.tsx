import Link from "next/link";
import { redirect } from "next/navigation";
import { CldImage } from "next-cloudinary";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { MemberHeader } from "~/components/layout/MemberHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

/**
 * My Listings Page
 *
 * Displays all listings owned by the current user.
 * Supports multiple home listings per member.
 */
export default async function MyListingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/listings");
  }

  // Get user with application status
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      application: {
        select: { status: true },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const isApproved = user.application?.status === "APPROVED";

  if (!isApproved) {
    redirect("/dashboard");
  }

  // Get all listings for this user with availability data
  const listings = await db.home.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      availability: {
        where: {
          endDate: { gte: new Date() },
        },
        orderBy: { startDate: "asc" },
        take: 1,
      },
    },
  });

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader userName={user.name} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
            <p className="mt-2 text-muted-foreground">
              {listings.length === 0
                ? "You haven't added any homes yet"
                : `${listings.length} home${listings.length !== 1 ? "s" : ""} listed`}
            </p>
          </div>
          <Button asChild>
            <Link href="/listings/new">
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Home
            </Link>
          </Button>
        </div>

        {/* Listings Grid */}
        {listings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}/photos`}
                className="block"
              >
                <Card className="h-full overflow-hidden transition-colors hover:border-primary/50">
                  {/* Photo */}
                  <div className="relative aspect-[4/3] bg-muted">
                    {listing.photos.length > 0 ? (
                      <CldImage
                        src={listing.photos[0]!}
                        alt={listing.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        crop="fill"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <svg
                          className="h-12 w-12 text-muted-foreground/50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    {/* Status Badges */}
                    <div className="absolute right-2 top-2 flex flex-col gap-1">
                      <div
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          listing.isActive
                            ? "bg-green-500/90 text-white"
                            : "bg-amber-500/90 text-white"
                        }`}
                      >
                        {listing.isActive ? "Published" : "Draft"}
                      </div>
                      {listing.bookingMode === "INSTANT_BOOK" && (
                        <div className="rounded-full bg-blue-500/90 px-2 py-1 text-xs font-medium text-white">
                          Instant Book
                        </div>
                      )}
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-1 text-lg">
                      {listing.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      {listing.location}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{listing.photos.length} photo{listing.photos.length !== 1 ? "s" : ""}</span>
                        <span>
                          {listing.exchangeType === "BOTH"
                            ? "Swaps & Points"
                            : listing.exchangeType === "SWAP_ONLY"
                            ? "Swaps Only"
                            : "Points Only"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          className={`h-4 w-4 ${
                            listing.availability.length > 0
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span
                          className={
                            listing.availability.length > 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-muted-foreground"
                          }
                        >
                          {listing.availability.length > 0
                            ? `Available from ${listing.availability[0]!.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                            : "No availability set"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="mx-auto max-w-md">
            <CardContent className="flex flex-col items-center py-12">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <svg
                  className="h-8 w-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-foreground">
                No homes listed yet
              </h3>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                Share your first home with the Art Res community and start
                connecting with fellow artists.
              </p>
              <Button asChild>
                <Link href="/listings/new">Add Your First Home</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
