import { Suspense } from "react";

import { Card, CardContent } from "~/components/ui/card";
import { MembersList } from "~/components/admin/MembersList";

/**
 * Admin Members Page
 *
 * Shows all approved members.
 * Story 7-7.
 */
export default function AdminMembersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Members</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage all Musa Residency members
        </p>
      </div>

      <Suspense fallback={<MembersSkeleton />}>
        <MembersList />
      </Suspense>
    </div>
  );
}

function MembersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-muted" />
      {Array.from({ length: 10 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
