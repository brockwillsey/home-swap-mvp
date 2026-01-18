import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { MemberHeader } from "~/components/layout/MemberHeader";
import { PointsContent } from "~/components/points/PointsContent";
import { Card, CardContent } from "~/components/ui/card";

/**
 * Points Page
 *
 * Shows user's points balance and transaction history.
 * Stories 5-1 and 5-4.
 */
export default async function PointsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/points");
  }

  // Get user for header and initial points
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, points: true },
  });

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader userName={user?.name} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">My Points</h1>

        <Suspense fallback={<PointsSkeleton />}>
          <PointsContent initialPoints={user?.points ?? 0} />
        </Suspense>
      </div>
    </main>
  );
}

function PointsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* History skeleton */}
      <Card>
        <CardContent className="py-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-5 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
