import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { MemberHeader } from "~/components/layout/MemberHeader";
import { MembershipStatus, RenewalReminderBanner } from "~/components/membership/MembershipStatus";
import { PointsBalanceDisplay } from "~/components/points/PointsBalanceDisplay";

/**
 * Dashboard Page (Placeholder)
 *
 * Main authenticated user landing page
 * - Verifies session contains user.id and user.role
 * - Displays welcome message
 * - Will be expanded in future stories
 */
export default async function DashboardPage() {
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  // Get user with application data for membership status
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      application: {
        select: {
          status: true,
          reviewedAt: true,
        },
      },
    },
  });

  const userPoints = user?.points ?? 0;

  const userName = session.user.name ?? user?.name;

  // Get membership start date (when application was approved)
  const membershipStartDate = user?.application?.reviewedAt ?? null;
  const isApproved = user?.application?.status === "APPROVED";

  // Get listing count for approved users
  const listingCount = isApproved
    ? await db.home.count({ where: { ownerId: session.user.id } })
    : 0;

  // Get campaigns count and total raised
  const campaigns = isApproved
    ? await db.fund.findMany({
        where: { creatorId: session.user.id },
        select: { id: true, status: true, currentAmount: true },
      })
    : [];
  const campaignCount = campaigns.length;
  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE").length;
  const totalRaised = campaigns.reduce((sum, c) => sum + c.currentAmount, 0);

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader activePage="dashboard" userName={userName} userPoints={userPoints} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Renewal Reminder Banner (shows if expiring/expired) */}
        {isApproved && (
          <div className="mb-6">
            <RenewalReminderBanner membershipStartDate={membershipStartDate} />
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back{userName ? `, ${userName}` : ""}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your Art Res dashboard
          </p>
        </div>

        {/* Points and Membership Status */}
        {isApproved && (
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <PointsBalanceDisplay points={userPoints} />
            <MembershipStatus
              membershipStartDate={membershipStartDate}
              showRenewalReminder
            />
          </div>
        )}

        {/* Feature cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/profile" className="block">
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">My Profile</CardTitle>
                <CardDescription>View and edit your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Update your bio, photo, and creative interests
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/members" className="block">
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">Community Members</CardTitle>
                <CardDescription>Browse fellow members</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View profiles of other Art Res members
                </p>
              </CardContent>
            </Card>
          </Link>

          {isApproved ? (
            <Link href="/listings" className="block">
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="text-lg">My Listings</CardTitle>
                  <CardDescription>
                    {listingCount === 0
                      ? "Share your space with the community"
                      : `${listingCount} home${listingCount !== 1 ? "s" : ""} listed`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {listingCount === 0
                      ? "Add your first home"
                      : "Manage your listings"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Listings</CardTitle>
                <CardDescription>Share your space with the community</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Available after membership approval
                </p>
              </CardContent>
            </Card>
          )}

          {isApproved ? (
            <Link href="/funds/my" className="block">
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="text-lg">My Campaigns</CardTitle>
                  <CardDescription>
                    {campaignCount === 0
                      ? "Create a fundraising campaign"
                      : `${activeCampaigns} active campaign${activeCampaigns !== 1 ? "s" : ""}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {campaignCount === 0
                      ? "Fund your creative projects"
                      : totalRaised > 0
                        ? `$${(totalRaised / 100).toLocaleString()} raised`
                        : "Manage your campaigns"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Campaigns</CardTitle>
                <CardDescription>Fund your creative projects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Available after membership approval
                </p>
              </CardContent>
            </Card>
          )}

          <Link href="/trips" className="block">
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">My Trips</CardTitle>
                <CardDescription>View your stays and hosting</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage your bookings and guest requests
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/messages" className="block">
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">Messages</CardTitle>
                <CardDescription>Chat with other members</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Send messages and coordinate with hosts
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
}
