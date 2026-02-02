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
 * Funds Browse Page
 *
 * Displays all active crowdfunding campaigns.
 */
export default async function FundsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/funds");
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
            <h1 className="text-3xl font-bold text-foreground">
              Support Artists
            </h1>
            <p className="mt-1 text-muted-foreground">
              Help fund creative projects and residencies in our community
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/funds/my">
              <Button variant="outline">My Funds</Button>
            </Link>
            <Link href="/funds/new">
              <Button>Start a Fund</Button>
            </Link>
          </div>
        </div>

        {/* Funds Grid */}
        <Suspense fallback={<FundsSkeleton />}>
          <FundsGrid />
        </Suspense>
      </div>
    </main>
  );
}

async function FundsGrid() {
  const funds = await db.fund.findMany({
    where: { status: "ACTIVE" },
    orderBy: { publishedAt: "desc" },
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
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold">No Active Funds</h3>
        <p className="mb-6 text-muted-foreground">
          Be the first to start a fundraising campaign!
        </p>
        <Link href="/funds/new">
          <Button>Start a Fund</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {funds.map((fund) => (
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
        />
      ))}
    </div>
  );
}

function FundsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
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
