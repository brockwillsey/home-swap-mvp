import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Card, CardContent } from "~/components/ui/card";
import { MemberHeader } from "~/components/layout/MemberHeader";

/**
 * Members Directory Page
 *
 * Lists all approved members in the community.
 * Only accessible to authenticated, approved members.
 */
export default async function MembersPage() {
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/members");
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

  // Get approved members with pagination limit
  // TODO: Add infinite scroll or pagination UI in future iteration
  const members = await db.user.findMany({
    where: {
      application: {
        status: "APPROVED",
      },
    },
    include: {
      application: {
        select: {
          profilePhotoUrl: true,
          location: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50, // Limit to prevent performance issues with large member counts
  });

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader activePage="members" />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Community Members</h1>
          <p className="mt-2 text-muted-foreground">
            Browse profiles of fellow Musa Residency members
          </p>
        </div>

        {members.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No members yet. Be the first to join!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((member) => {
              const memberImage = member.image ?? member.application?.profilePhotoUrl;
              const memberLocation = member.location ?? member.application?.location;
              const memberSince = member.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              });
              const isCurrentUser = member.id === session.user.id;

              return (
                <Link key={member.id} href={`/members/${member.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        {/* Profile Photo */}
                        <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full bg-muted">
                          {memberImage ? (
                            <Image
                              src={memberImage}
                              alt={member.name ?? "Member photo"}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl text-muted-foreground">
                              {member.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <h2 className="text-lg font-semibold text-foreground">
                          {member.name ?? "Anonymous"}
                          {isCurrentUser && (
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                              (You)
                            </span>
                          )}
                        </h2>

                        {/* Location */}
                        {memberLocation && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {memberLocation}
                          </p>
                        )}

                        {/* Member Since */}
                        <p className="mt-2 text-xs text-muted-foreground">
                          Member since {memberSince}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
