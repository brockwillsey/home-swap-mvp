import Link from "next/link";

import { db } from "~/server/db";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

interface DonateSuccessPageProps {
  searchParams: Promise<{
    session_id?: string;
    fund_id?: string;
  }>;
}

/**
 * Donation Success Page
 *
 * Shown after a successful donation checkout.
 */
export default async function DonateSuccessPage({ searchParams }: DonateSuccessPageProps) {
  const { fund_id } = await searchParams;

  // Get fund details if available
  let fund = null;
  if (fund_id) {
    fund = await db.fund.findUnique({
      where: { id: fund_id },
      select: {
        id: true,
        title: true,
        creator: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Thank You!
          </h1>

          {/* Message */}
          <p className="mb-6 text-muted-foreground">
            {fund ? (
              <>
                Your donation to <span className="font-medium text-foreground">&quot;{fund.title}&quot;</span> has been received.
                {fund.creator.name && (
                  <> {fund.creator.name} will be notified of your generous support.</>
                )}
              </>
            ) : (
              <>Your donation has been received. Thank you for supporting our community!</>
            )}
          </p>

          {/* Receipt Note */}
          <div className="mb-6 rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              You&apos;ll receive an email receipt shortly. A 10% platform fee helps maintain Art Res.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {fund && (
              <Link href={`/funds/${fund.id}`} className="block">
                <Button className="w-full">
                  Back to Campaign
                </Button>
              </Link>
            )}
            <Link href="/funds" className="block">
              <Button variant="outline" className="w-full">
                Browse More Campaigns
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
