import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { MemberHeader } from "~/components/layout/MemberHeader";
import { FundProgress } from "~/components/fund/FundProgress";
import { DonationForm } from "~/components/donation/DonationForm";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

interface FundPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Fund Detail Page
 *
 * Displays fund details and allows donations.
 */
export default async function FundPage({ params }: FundPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/funds/${id}`);
  }

  // Get user for header
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  // Get fund with creator and donations
  const fund = await db.fund.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
        },
      },
      home: {
        select: {
          id: true,
          title: true,
          location: true,
          photos: true,
        },
      },
      donations: {
        where: { status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        take: 10,
        select: {
          id: true,
          amount: true,
          message: true,
          isAnonymous: true,
          completedAt: true,
          donor: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!fund) {
    notFound();
  }

  // Check access - only creator can see non-active funds
  const isCreator = session.user.id === fund.creatorId;
  if (fund.status !== "ACTIVE" && !isCreator) {
    notFound();
  }

  // Count donations
  const donationCount = await db.donation.count({
    where: { fundId: id, status: "COMPLETED" },
  });

  // Format date
  const publishedDate = fund.publishedAt
    ? new Date(fund.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader userName={user?.name} />

      <div className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/funds"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Funds
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            {fund.coverImage && (
              <div className="relative aspect-video overflow-hidden rounded-xl">
                <Image
                  src={fund.coverImage}
                  alt={fund.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Title & Status */}
            <div>
              {isCreator && fund.status !== "ACTIVE" && (
                <div className="mb-2">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      fund.status === "DRAFT"
                        ? "bg-yellow-100 text-yellow-800"
                        : fund.status === "PAUSED"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {fund.status}
                  </span>
                </div>
              )}
              <h1 className="text-3xl font-bold text-foreground">{fund.title}</h1>
              {publishedDate && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Started {publishedDate}
                </p>
              )}
            </div>

            {/* Creator */}
            <div className="flex items-center gap-3">
              {fund.creator.image ? (
                <Image
                  src={fund.creator.image}
                  alt={fund.creator.name ?? "Creator"}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-medium text-primary">
                  {fund.creator.name?.charAt(0) ?? "?"}
                </div>
              )}
              <div>
                <p className="font-medium">{fund.creator.name ?? "Member"}</p>
                <p className="text-sm text-muted-foreground">Campaign Creator</p>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {fund.description.split("\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Linked Home */}
            {fund.home && (
              <Card>
                <CardHeader>
                  <CardTitle>Linked Listing</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/search/${fund.home.id}`}
                    className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    {fund.home.photos && JSON.parse(fund.home.photos)[0] && (
                      <Image
                        src={JSON.parse(fund.home.photos)[0]}
                        alt={fund.home.title}
                        width={80}
                        height={60}
                        className="rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{fund.home.title}</p>
                      <p className="text-sm text-muted-foreground">{fund.home.location}</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Recent Supporters */}
            {fund.donations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Supporters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fund.donations.map((donation) => (
                      <div key={donation.id} className="flex items-start gap-3">
                        {donation.isAnonymous ? (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        ) : donation.donor?.image ? (
                          <Image
                            src={donation.donor.image}
                            alt={donation.donor.name ?? "Supporter"}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                            {donation.donor?.name?.charAt(0) ?? "?"}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-baseline justify-between">
                            <p className="font-medium">
                              {donation.isAnonymous
                                ? "Anonymous"
                                : donation.donor?.name ?? "Supporter"}
                            </p>
                            <p className="text-sm font-medium text-primary">
                              ${(donation.amount / 100).toFixed(0)}
                            </p>
                          </div>
                          {donation.message && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              &quot;{donation.message}&quot;
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {donation.completedAt &&
                              new Date(donation.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress */}
            <Card>
              <CardContent className="pt-6">
                <FundProgress
                  currentAmount={fund.currentAmount}
                  goalAmount={fund.goalAmount}
                  donationCount={donationCount}
                  size="lg"
                />
              </CardContent>
            </Card>

            {/* Donation Form or Edit Button */}
            {isCreator ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="mb-4 text-sm text-muted-foreground">
                    This is your campaign. You can edit or manage it from the edit page.
                  </p>
                  <Link href={`/funds/${id}/edit`}>
                    <Button className="w-full">Edit Campaign</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : fund.status === "ACTIVE" ? (
              <DonationForm
                fundId={fund.id}
                fundTitle={fund.title}
                creatorName={fund.creator.name}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    This campaign is not currently accepting donations.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
