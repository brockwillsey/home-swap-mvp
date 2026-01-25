"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { ListingCard } from "~/components/cards/ListingCard";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

interface SearchResultsProps {
  location?: string;
  startDate?: string;
  endDate?: string;
  exchangeType?: "SWAP_ONLY" | "POINTS_ONLY" | "BOTH" | "ALL";
  bookingMode?: "INSTANT_BOOK" | "REQUIRES_APPROVAL" | "ALL";
}

/**
 * Search Results Component
 *
 * Displays search results in a grid with infinite scroll.
 * Shows empty state when no results found.
 */
export function SearchResults({
  location,
  startDate,
  endDate,
  exchangeType,
  bookingMode,
}: SearchResultsProps) {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = api.search.homes.useInfiniteQuery(
    {
      location,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      exchangeType,
      bookingMode,
      limit: 12,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // Infinite scroll
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <ResultsSkeleton />;
  }

  if (isError) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center py-12">
          <div className="mb-4 rounded-full bg-destructive/10 p-4">
            <svg
              className="h-8 w-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mb-2 font-semibold text-foreground">
            Something went wrong
          </h3>
          <p className="text-center text-sm text-muted-foreground">
            We couldn&apos;t load the search results. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const homes = data?.pages.flatMap((page) => page.homes) ?? [];

  if (homes.length === 0) {
    return (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 font-semibold text-foreground">
            No homes available
            {location ? ` in "${location}"` : ""}
          </h3>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            {startDate && endDate
              ? "Try adjusting your dates or searching a different location."
              : "Try searching for a different location or check back later."}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.href = "/search"}
            >
              Clear Search
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Results Count */}
      <p className="mb-4 text-sm text-muted-foreground">
        {homes.length} home{homes.length !== 1 ? "s" : ""} found
        {location ? ` in "${location}"` : ""}
        {exchangeType && exchangeType !== "ALL" && (
          <> ({exchangeType === "SWAP_ONLY" ? "Swaps" : exchangeType === "POINTS_ONLY" ? "Points" : "Swaps & Points"})</>
        )}
        {startDate && endDate && (
          <>
            {" "}for {new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {" "}- {new Date(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </>
        )}
      </p>

      {/* Results Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {homes.map((home) => (
          <ListingCard
            key={home.id}
            id={home.id}
            title={home.title}
            location={home.location}
            photos={home.photos}
            bookingMode={home.bookingMode}
            exchangeType={home.exchangeType}
            owner={home.owner}
            availability={home.availability}
          />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {hasNextPage && (
        <div ref={ref} className="mt-8 flex justify-center">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Loading more...
            </div>
          ) : (
            <Button variant="outline" onClick={() => fetchNextPage()}>
              Load More
            </Button>
          )}
        </div>
      )}
    </div>
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
