import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { MemberHeader } from "~/components/layout/MemberHeader";
import { SearchBar } from "~/components/search/SearchBar";
import { SearchResults } from "~/components/search/SearchResults";
import { Card, CardContent } from "~/components/ui/card";

interface SearchPageProps {
  searchParams: Promise<{
    location?: string;
    startDate?: string;
    endDate?: string;
    exchangeType?: "SWAP_ONLY" | "POINTS_ONLY" | "BOTH" | "ALL";
    bookingMode?: "INSTANT_BOOK" | "REQUIRES_APPROVAL" | "ALL";
  }>;
}

/**
 * Search Page
 *
 * Allows members to search for available homes by location and dates.
 * Stories 3-1, 3-2, 3-3.
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/search");
  }

  // Get user for header
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  const { location, startDate, endDate, exchangeType, bookingMode } = params;

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader userName={user?.name} />

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-foreground">
            Find Your Next Stay
          </h1>
          <Suspense fallback={<SearchBarSkeleton />}>
            <SearchBar
              initialLocation={location}
              initialStartDate={startDate}
              initialEndDate={endDate}
              initialExchangeType={exchangeType}
              initialBookingMode={bookingMode}
            />
          </Suspense>
        </div>

        {/* Search Results */}
        <Suspense fallback={<ResultsSkeleton />}>
          <SearchResults
            location={location}
            startDate={startDate}
            endDate={endDate}
            exchangeType={exchangeType}
            bookingMode={bookingMode}
          />
        </Suspense>
      </div>
    </main>
  );
}

function SearchBarSkeleton() {
  return (
    <div className="h-[100px] animate-pulse rounded-xl border bg-muted" />
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-[4/3] animate-pulse bg-muted" />
          <CardContent className="space-y-3 pt-4">
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
