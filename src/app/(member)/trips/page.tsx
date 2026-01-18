import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { MemberHeader } from "~/components/layout/MemberHeader";
import { TripsContent } from "~/components/trips/TripsContent";
import { Card, CardContent } from "~/components/ui/card";

/**
 * Trips Page
 *
 * Shows all bookings for the current user as both guest and host.
 * Story 4-8.
 */
export default async function TripsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/trips");
  }

  // Get user for header
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, points: true },
  });

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader userName={user?.name} userPoints={user?.points} activePage="trips" />

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">My Trips</h1>

        <Suspense fallback={<TripsSkeleton />}>
          <TripsContent />
        </Suspense>
      </div>
    </main>
  );
}

function TripsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex gap-4 py-4">
            <div className="h-24 w-32 animate-pulse rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
