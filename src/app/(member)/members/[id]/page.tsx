import Link from "next/link";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { MemberHeader } from "~/components/layout/MemberHeader";

interface MemberProfilePageProps {
  params: Promise<{ id: string }>;
}

/**
 * Member Profile Page
 *
 * Displays another member's public profile information.
 * Only accessible to authenticated, approved members.
 */
export default async function MemberProfilePage({ params }: MemberProfilePageProps) {
  const { id: memberId } = await params;
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/members/${memberId}`);
  }

  // Verify the viewing user is approved
  const viewingUser = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      application: {
        select: { status: true },
      },
    },
  });

  if (!viewingUser || viewingUser.application?.status !== "APPROVED") {
    redirect("/dashboard");
  }

  // Get the member being viewed
  const member = await db.user.findUnique({
    where: { id: memberId },
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

  // Member not found or not approved
  if (!member || member.application?.status !== "APPROVED") {
    notFound();
  }

  // Build profile data with fallbacks to application
  const profileData = {
    name: member.name,
    image: member.image ?? member.application?.profilePhotoUrl,
    bio: member.bio ?? member.application?.bio,
    location: member.location ?? member.application?.location,
    creativeInterests: member.creativeInterests ?? member.application?.creativeInterests,
    createdAt: member.createdAt,
  };

  const memberSince = profileData.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  // Check if viewing own profile
  const isOwnProfile = session.user.id === memberId;

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader activePage="members" />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isOwnProfile ? "My Profile" : "Member Profile"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isOwnProfile
                ? "View your profile information"
                : `Learn more about ${profileData.name ?? "this member"}`}
            </p>
          </div>
          {isOwnProfile && (
            <Button asChild>
              <Link href="/profile/edit">Edit Profile</Link>
            </Button>
          )}
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
                      sizes="128px"
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
              </div>
            </CardContent>
          </Card>

          {/* Bio & Creative Interests */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>
                {isOwnProfile ? "Your profile information" : "Member information"}
              </CardDescription>
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
            </CardContent>
          </Card>

          {/* Listed Homes (Placeholder for Epic 2) */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Listed Homes</CardTitle>
              <CardDescription>
                {isOwnProfile
                  ? "Your homes available for exchange"
                  : `${profileData.name ?? "This member"}'s homes available for exchange`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">
                  No homes listed yet
                </p>
                {isOwnProfile && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Home listings will be available in a future update
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back to Members Link */}
        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link href="/members">Back to Members</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
