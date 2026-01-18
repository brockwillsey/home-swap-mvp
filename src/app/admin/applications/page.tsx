import { Suspense } from "react";

import { Card, CardContent } from "~/components/ui/card";
import { ApplicationsList } from "~/components/admin/ApplicationsList";

/**
 * Admin Applications Page
 *
 * Shows pending membership applications for review.
 * Stories 7-1, 7-2.
 */
export default function AdminApplicationsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Applications</h1>
        <p className="mt-2 text-muted-foreground">
          Review and process membership applications
        </p>
      </div>

      <Suspense fallback={<ApplicationsSkeleton />}>
        <ApplicationsList />
      </Suspense>
    </div>
  );
}

function ApplicationsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-8 w-20 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
