import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { MemberHeader } from "~/components/layout/MemberHeader";
import { FundForm } from "~/components/forms/FundForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

/**
 * Create Fund Page
 *
 * Allows approved members to create a new crowdfunding campaign.
 */
export default async function NewFundPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/funds/new");
  }

  // Check if user is approved
  const application = await db.application.findUnique({
    where: { userId: session.user.id },
    select: { status: true },
  });

  if (application?.status !== "APPROVED") {
    redirect("/funds?error=not-approved");
  }

  // Get user for header and their homes
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      homes: {
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          location: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader userName={user?.name} />

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Start a Fundraising Campaign
          </h1>
          <p className="mt-1 text-muted-foreground">
            Share your creative project and gather support from the community
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">1.</span>
                <span>Create your campaign with a compelling title and description</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">2.</span>
                <span>Set your fundraising goal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">3.</span>
                <span>Publish when ready - you can edit anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">4.</span>
                <span>Share with the community and receive donations</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Note: A 10% platform fee is deducted from donations to help maintain Musa Residency.
              Funds are manually paid out by our team.
            </p>
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Tell potential supporters about your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FundForm mode="create" userHomes={user?.homes ?? []} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
