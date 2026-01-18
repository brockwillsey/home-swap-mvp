import { notFound } from "next/navigation";
import { Suspense } from "react";

import { db } from "~/server/db";
import { Card, CardContent } from "~/components/ui/card";
import { ApplicationDetail } from "~/components/admin/ApplicationDetail";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Admin Application Detail Page
 *
 * Shows full application details for review.
 * Stories 7-2, 7-3, 7-4, 7-5.
 */
export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params;

  // Verify application exists
  const application = await db.application.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!application) {
    notFound();
  }

  return (
    <div>
      <Suspense fallback={<ApplicationDetailSkeleton />}>
        <ApplicationDetail applicationId={id} />
      </Suspense>
    </div>
  );
}

function ApplicationDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="h-32 w-32 animate-pulse rounded-full bg-muted" />
              <div className="mt-4 h-6 w-32 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-24 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4 pt-6">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
