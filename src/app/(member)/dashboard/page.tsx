import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { MemberHeader } from "~/components/layout/MemberHeader";
import { MembershipStatus, RenewalReminderBanner } from "~/components/membership/MembershipStatus";

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

  const userName = session.user.name ?? user?.name;

  // Get membership start date (when application was approved)
  const membershipStartDate = user?.application?.reviewedAt ?? null;
  const isApproved = user?.application?.status === "APPROVED";

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader activePage="dashboard" userName={userName} />

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

        {/* Membership Status Card */}
        {isApproved && (
          <div className="mb-8">
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
            <Link href="/listings/new" className="block">
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="text-lg">Add Home</CardTitle>
                  <CardDescription>Share your space with the community</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Create a listing for your home
                  </p>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Home</CardTitle>
                <CardDescription>Share your space with the community</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Available after membership approval
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Bookings</CardTitle>
              <CardDescription>View your reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Coming in Epic 4
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Messages</CardTitle>
              <CardDescription>Chat with other members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Coming in Epic 6
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
