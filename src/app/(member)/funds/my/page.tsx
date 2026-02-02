import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { MemberHeader } from "~/components/layout/MemberHeader";
import { FundCard } from "~/components/cards/FundCard";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

/**
 * My Funds Page
 *
 * Displays the user's created crowdfunding campaigns.
 */
export default async function MyFundsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/funds/my");
  }

  // Get user for header
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader userName={user?.name} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Campaigns</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your crowdfunding campaigns
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/funds">
              <Button variant="outline">Browse All Funds</Button>
            </Link>
            <Link href="/funds/new">
              <Button>Start New Fund</Button>
            </Link>
          </div>
        </div>

        {/* Funds Grid */}
        <Suspense fallback={<FundsSkeleton />}>
          <MyFundsGrid userId={session.user.id} />
        </Suspense>
      </div>
    </main>
  );
}

async function MyFundsGrid({ userId }: { userId: string }) {
  const funds = await db.fund.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          donations: {
            where: { status: "COMPLETED" },
          },
        },
      },
    },
  });

  if (funds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold">No Campaigns Yet</h3>
        <p className="mb-6 max-w-sm text-muted-foreground">
          Start your first fundraising campaign to get support for your creative projects.
        </p>
        <Link href="/funds/new">
          <Button>Create Your First Campaign</Button>
        </Link>
      </div>
    );
  }

  // Group by status
  const draftFunds = funds.filter((f) => f.status === "DRAFT");
  const activeFunds = funds.filter((f) => f.status === "ACTIVE");
  const pausedFunds = funds.filter((f) => f.status === "PAUSED");
  const completedFunds = funds.filter((f) => f.status === "COMPLETED" || f.status === "CANCELLED");

  return (
    <div className="space-y-10">
      {/* Active Funds */}
      {activeFunds.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Active ({activeFunds.length})
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeFunds.map((fund) => (
              <FundCard
                key={fund.id}
                id={fund.id}
                title={fund.title}
                description={fund.description}
                goalAmount={fund.goalAmount}
                currentAmount={fund.currentAmount}
                coverImage={fund.coverImage}
                status={fund.status}
                creator={fund.creator}
                donationCount={fund._count.donations}
                isOwner
              />
            ))}
          </div>
        </section>
      )}

      {/* Draft Funds */}
      {draftFunds.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            Drafts ({draftFunds.length})
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {draftFunds.map((fund) => (
              <FundCard
                key={fund.id}
                id={fund.id}
                title={fund.title}
                description={fund.description}
                goalAmount={fund.goalAmount}
                currentAmount={fund.currentAmount}
                coverImage={fund.coverImage}
                status={fund.status}
                creator={fund.creator}
                donationCount={fund._count.donations}
                isOwner
              />
            ))}
          </div>
        </section>
      )}

      {/* Paused Funds */}
      {pausedFunds.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            Paused ({pausedFunds.length})
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pausedFunds.map((fund) => (
              <FundCard
                key={fund.id}
                id={fund.id}
                title={fund.title}
                description={fund.description}
                goalAmount={fund.goalAmount}
                currentAmount={fund.currentAmount}
                coverImage={fund.coverImage}
                status={fund.status}
                creator={fund.creator}
                donationCount={fund._count.donations}
                isOwner
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed/Cancelled Funds */}
      {completedFunds.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            Completed ({completedFunds.length})
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {completedFunds.map((fund) => (
              <FundCard
                key={fund.id}
                id={fund.id}
                title={fund.title}
                description={fund.description}
                goalAmount={fund.goalAmount}
                currentAmount={fund.currentAmount}
                coverImage={fund.coverImage}
                status={fund.status}
                creator={fund.creator}
                donationCount={fund._count.donations}
                isOwner
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FundsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-video animate-pulse bg-muted" />
          <CardContent className="space-y-3 pt-4">
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-2 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
