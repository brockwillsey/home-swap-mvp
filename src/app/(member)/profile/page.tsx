import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { SignOutButton } from "~/components/auth/SignOutButton";

/**
 * Profile View Page
 *
 * Displays the current member's profile information.
 * Only accessible to approved members.
 */
export default async function ProfilePage() {
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/profile");
  }

  // Get user with application data
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      application: {
        select: {
          status: true,
          bio: true,
          location: true,
          creativeInterests: true,
          profilePhotoUrl: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // Check if user is approved
  const isApproved = user.application?.status === "APPROVED";

  // Redirect non-approved users
  if (!isApproved) {
    // If they have an application, go to dashboard to see status
    if (user.application) {
      redirect("/dashboard");
    }
    // Otherwise, they need to apply
    redirect("/apply");
  }

  // Build profile data, falling back to application data if user fields are empty
  // Note: Actual sync to User table happens in the profile.getProfile tRPC procedure
  // or when user saves their profile. Here we just display the best available data.
  const profileData = {
    name: user.name,
    email: user.email,
    image: user.image ?? user.application?.profilePhotoUrl,
    bio: user.bio ?? user.application?.bio,
    location: user.location ?? user.application?.location,
    creativeInterests: user.creativeInterests ?? user.application?.creativeInterests,
    createdAt: user.createdAt,
    points: user.points,
  };

  const memberSince = profileData.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            Art Res
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="mt-2 text-muted-foreground">
              View and manage your profile information
            </p>
          </div>
          <Button asChild>
            <Link href="/profile/edit">Edit Profile</Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Photo & Basic Info */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {/* Profile Photo */}
                <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full bg-muted">
                  {profileData.image ? (
                    <Image
                      src={profileData.image}
                      alt={profileData.name ?? "Profile photo"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl text-muted-foreground">
                      {profileData.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>

                {/* Name */}
                <h2 className="text-xl font-semibold text-foreground">
                  {profileData.name ?? "No name set"}
                </h2>

                {/* Location */}
                {profileData.location && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {profileData.location}
                  </p>
                )}

                {/* Member Since */}
                <p className="mt-2 text-xs text-muted-foreground">
                  Member since {memberSince}
                </p>

                {/* Points */}
                <div className="mt-4 rounded-lg bg-primary/10 px-4 py-2">
                  <p className="text-sm font-medium text-primary">
                    {profileData.points} points
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio & Creative Interests */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>Your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bio */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Bio
                </h3>
                <p className="text-foreground">
                  {profileData.bio ?? (
                    <span className="italic text-muted-foreground">
                      No bio added yet
                    </span>
                  )}
                </p>
              </div>

              {/* Creative Interests */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Creative Interests
                </h3>
                <p className="text-foreground">
                  {profileData.creativeInterests ?? (
                    <span className="italic text-muted-foreground">
                      No creative interests added yet
                    </span>
                  )}
                </p>
              </div>

              {/* Email */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Email
                </h3>
                <p className="text-foreground">{profileData.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit CTA for mobile */}
        <div className="mt-6 lg:hidden">
          <Button asChild className="w-full">
            <Link href="/profile/edit">Edit Profile</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
