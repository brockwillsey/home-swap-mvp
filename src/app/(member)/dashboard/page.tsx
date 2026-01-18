import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { SignOutButton } from "~/components/auth/SignOutButton";

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

  // Verify session contains required fields (per AC #2)
  const userId = session.user.id;
  // Default to MEMBER role for users without explicit role assignment
  // This is expected for new users - ADMIN role is explicitly set by admins
  const userRole = session.user.role ?? "MEMBER";
  const userEmail = session.user.email;
  const userName = session.user.name;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            Art Res
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {userName ?? userEmail}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back{userName ? `, ${userName}` : ""}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your Art Res dashboard
          </p>
        </div>

        {/* Session info card - for verification */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
            <CardDescription>
              Your authenticated session details (AC #2 verification)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="font-medium text-muted-foreground">User ID:</dt>
                <dd className="font-mono text-xs">{userId}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-muted-foreground">Email:</dt>
                <dd>{userEmail}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-muted-foreground">Role:</dt>
                <dd>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {userRole}
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Listings</CardTitle>
              <CardDescription>Manage your home listings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Coming in Epic 2
              </p>
            </CardContent>
          </Card>

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
