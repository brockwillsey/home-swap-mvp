import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { CldImage } from "next-cloudinary";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { MemberHeader } from "~/components/layout/MemberHeader";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { PhotoGallery } from "~/components/listing/PhotoGallery";
import { AvailabilityDisplay } from "~/components/listing/AvailabilityDisplay";
import { BookingForm } from "~/components/booking/BookingForm";

/**
 * Listing Detail Page
 *
 * Shows full listing details for search results.
 * Stories 3-4 and 3-5.
 */
export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/search/" + id);
  }

  // Get the listing with owner info and availability
  const listing = await db.home.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
          location: true,
          creativeInterests: true,
          createdAt: true,
        },
      },
      availability: {
        where: {
          endDate: { gte: new Date() },
        },
        orderBy: { startDate: "asc" },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  // Only show active listings to non-owners
  if (!listing.isActive && listing.ownerId !== session.user.id) {
    notFound();
  }

  // Get user for header, points display, and booking info
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, points: true },
  });
  const userPoints = user?.points ?? 0;

  // Get user's homes for swap offers
  const userHomesRaw = await db.home.findMany({
    where: {
      ownerId: session.user.id,
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      location: true,
      photos: true,
    },
  });

  // Parse photos from JSON string
  const userHomes = userHomesRaw.map((home) => ({
    ...home,
    photos: typeof home.photos === "string" ? (JSON.parse(home.photos) as string[]) : home.photos,
  }));

  const isOwnListing = listing.ownerId === session.user.id;

  // Count owner's other listings
  const otherListingsCount = await db.home.count({
    where: {
      ownerId: listing.ownerId,
      isActive: true,
      id: { not: listing.id },
    },
  });

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader userName={user?.name} userPoints={userPoints} />

      <div className="container mx-auto px-4 py-8">
        {/* Back link */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/search">
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
              Back to Search
            </Link>
          </Button>
        </div>

        {/* Title Section */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {listing.title}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-muted-foreground">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {listing.location}
              </p>
            </div>

            {/* Badges */}
            <div className="flex gap-2">
              {listing.bookingMode === "INSTANT_BOOK" && (
                <div className="flex items-center gap-1 rounded-full bg-blue-500/90 px-3 py-1 text-sm font-medium text-white">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Instant Book
                </div>
              )}
              <div className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                {listing.exchangeType === "BOTH"
                  ? "Swaps & Points"
                  : listing.exchangeType === "SWAP_ONLY"
                  ? "Swaps Only"
                  : "Points Only"}
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="mb-8">
          <PhotoGallery photos={listing.photos} title={listing.title} />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {listing.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About this home</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {listing.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>
                  {listing.bookingMode === "INSTANT_BOOK"
                    ? "This home accepts instant bookings"
                    : "Booking requires host approval"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AvailabilityDisplay availability={listing.availability} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Card - Story 3-5 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Meet your host</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/members/${listing.owner.id}`}
                  className="block transition-opacity hover:opacity-80"
                >
                  <div className="flex items-center gap-4">
                    {listing.owner.image ? (
                      <CldImage
                        src={listing.owner.image}
                        alt={listing.owner.name ?? "Host"}
                        width={64}
                        height={64}
                        crop="fill"
                        gravity="face"
                        className="rounded-full"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                        {listing.owner.name?.charAt(0) ?? "?"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {listing.owner.name ?? "Member"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Member since {listing.owner.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </Link>

                {listing.owner.bio && (
                  <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
                    {listing.owner.bio}
                  </p>
                )}

                {listing.owner.creativeInterests && (
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Creative Interests
                    </p>
                    <p className="mt-1 text-sm">{listing.owner.creativeInterests}</p>
                  </div>
                )}

                {otherListingsCount > 0 && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {otherListingsCount} other listing{otherListingsCount !== 1 ? "s" : ""} available
                  </p>
                )}

                <div className="mt-4 flex flex-col gap-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/members/${listing.owner.id}`}>
                      View Full Profile
                    </Link>
                  </Button>
                  {!isOwnListing && (
                    <Button variant="secondary" className="w-full" asChild>
                      <Link
                        href={`/messages?user=${listing.owner.id}&context=LISTING_INQUIRY&contextId=${listing.id}`}
                      >
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
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        Message Host
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            {!isOwnListing && (
              <BookingForm
                listingId={listing.id}
                listingTitle={listing.title}
                bookingMode={listing.bookingMode}
                exchangeType={listing.exchangeType}
                availability={listing.availability}
                userPoints={user?.points ?? 0}
                userHomes={userHomes}
              />
            )}

            {/* Edit Link for owners */}
            {isOwnListing && (
              <Card>
                <CardContent className="pt-6">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/listings/${listing.id}/photos`}>
                      Edit This Listing
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
