import Link from "next/link";
import Image from "next/image";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

interface ListingCardProps {
  id: string;
  title: string;
  location: string;
  photos: string[];
  bookingMode: "INSTANT_BOOK" | "REQUIRES_APPROVAL";
  exchangeType: "SWAP_ONLY" | "POINTS_ONLY" | "BOTH";
  owner: {
    id: string;
    name: string | null;
    image: string | null;
  };
  availability?: {
    startDate: Date;
    endDate: Date;
  }[];
}

/**
 * Listing Card Component
 *
 * Displays a home listing in a card format for search results.
 * Shows cover photo, title, location, host info, and booking badges.
 */
export function ListingCard({
  id,
  title,
  location,
  photos,
  bookingMode,
  owner,
  availability = [],
}: ListingCardProps) {
  const hasAvailability = availability.length > 0;
  const nextAvailable = hasAvailability ? availability[0] : null;

  return (
    <Link href={`/search/${id}`} className="block">
      <Card className="h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
        {/* Photo */}
        <div className="relative aspect-[4/3] bg-muted">
          {photos.length > 0 ? (
            <Image
              src={photos[0]!}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {bookingMode === "INSTANT_BOOK" && (
              <div className="flex items-center gap-1 rounded-full bg-blue-500/90 px-2 py-1 text-xs font-medium text-white">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Instant Book
              </div>
            )}
          </div>

          {/* Photo count */}
          {photos.length > 1 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {photos.length}
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1 text-lg">{title}</CardTitle>
          <CardDescription className="line-clamp-1">{location}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Host info */}
            <div className="flex items-center gap-2">
              {owner.image ? (
                <Image
                  src={owner.image}
                  alt={owner.name ?? "Host"}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {owner.name?.charAt(0) ?? "?"}
                </div>
              )}
              <span className="text-sm text-muted-foreground">
                Hosted by {owner.name ?? "Member"}
              </span>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2 text-sm">
              <svg
                className={`h-4 w-4 ${hasAvailability ? "text-green-500" : "text-muted-foreground"}`}
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
              <span className={hasAvailability ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                {nextAvailable
                  ? `Available ${nextAvailable.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${nextAvailable.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                  : "Check availability"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
