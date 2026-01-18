import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { SignOutButton } from "~/components/auth/SignOutButton";
import { ProfileEditForm } from "~/components/forms/ProfileEditForm";

/**
 * Profile Edit Page
 *
 * Allows approved members to edit their profile information.
 */
export default async function ProfileEditPage() {
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/profile/edit");
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
    redirect("/dashboard");
  }

  // Get profile data, syncing from application if needed
  const profileData = {
    name: user.name ?? "",
    image: user.image ?? user.application?.profilePhotoUrl ?? "",
    bio: user.bio ?? user.application?.bio ?? "",
    location: user.location ?? user.application?.location ?? "",
    creativeInterests:
      user.creativeInterests ?? user.application?.creativeInterests ?? "",
  };

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
              href="/profile"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back to Profile
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Update your profile information
          </p>
        </div>

        <ProfileEditForm initialData={profileData} />
      </div>
    </main>
  );
}
