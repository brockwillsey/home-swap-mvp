"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { MemberHeader } from "~/components/layout/MemberHeader";
import { FundForm } from "~/components/forms/FundForm";
import { FundProgress } from "~/components/fund/FundProgress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

interface EditFundPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Edit Fund Page
 *
 * Allows fund creators to edit their campaigns and manage status.
 */
export default function EditFundPage({ params }: EditFundPageProps) {
  // Unwrap params using React.use() pattern
  const { id } = require("react").use(params);
  const router = useRouter();

  // Fetch fund data
  const { data: fund, isLoading, error } = api.fund.getById.useQuery({ id });

  // Fetch user's homes
  const { data: listings } = api.listing.getMyListings.useQuery();

  // Mutations
  const publishFund = api.fund.publish.useMutation({
    onSuccess: () => {
      toast.success("Campaign published!");
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const pauseFund = api.fund.pause.useMutation({
    onSuccess: () => {
      toast.success("Campaign paused");
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const resumeFund = api.fund.resume.useMutation({
    onSuccess: () => {
      toast.success("Campaign resumed!");
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteFund = api.fund.delete.useMutation({
    onSuccess: () => {
      toast.success("Campaign deleted");
      router.push("/funds/my");
    },
    onError: (error) => toast.error(error.message),
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <MemberHeader />
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-muted" />
            <div className="h-64 rounded-lg bg-muted" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !fund) {
    return (
      <main className="min-h-screen bg-background">
        <MemberHeader />
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Fund Not Found</h1>
            <p className="mt-2 text-muted-foreground">
              This fund doesn&apos;t exist or you don&apos;t have permission to edit it.
            </p>
            <Link href="/funds/my">
              <Button className="mt-4">Back to My Funds</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const userHomes = listings?.map((h) => ({
    id: h.id,
    title: h.title,
    location: h.location,
  })) ?? [];

  const donationCount = fund.donationCount ?? 0;

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Back Link */}
        <Link
          href="/funds/my"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Funds
        </Link>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Campaign</h1>
            <p className="mt-1 text-muted-foreground">
              Update your campaign details and manage its status
            </p>
          </div>
          <Link href={`/funds/${id}`}>
            <Button variant="outline">View Public Page</Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>
                  Update your campaign information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FundForm
                  mode="edit"
                  fundId={id}
                  initialData={{
                    title: fund.title,
                    description: fund.description,
                    goalAmount: fund.goalAmount,
                    homeId: fund.home?.id,
                    coverImage: fund.coverImage,
                  }}
                  userHomes={userHomes}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      fund.status === "DRAFT"
                        ? "bg-yellow-100 text-yellow-800"
                        : fund.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : fund.status === "PAUSED"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {fund.status}
                  </span>
                </div>

                {/* Status Actions */}
                {fund.status === "DRAFT" && (
                  <Button
                    className="w-full"
                    onClick={() => publishFund.mutate({ id })}
                    disabled={publishFund.isPending}
                  >
                    {publishFund.isPending ? "Publishing..." : "Publish Campaign"}
                  </Button>
                )}

                {fund.status === "ACTIVE" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => pauseFund.mutate({ id })}
                    disabled={pauseFund.isPending}
                  >
                    {pauseFund.isPending ? "Pausing..." : "Pause Campaign"}
                  </Button>
                )}

                {fund.status === "PAUSED" && (
                  <Button
                    className="w-full"
                    onClick={() => resumeFund.mutate({ id })}
                    disabled={resumeFund.isPending}
                  >
                    {resumeFund.isPending ? "Resuming..." : "Resume Campaign"}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle>Fundraising Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <FundProgress
                  currentAmount={fund.currentAmount}
                  goalAmount={fund.goalAmount}
                  donationCount={donationCount}
                />
              </CardContent>
            </Card>

            {/* Danger Zone */}
            {fund.status === "DRAFT" && (
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Permanently delete this campaign. This action cannot be undone.
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this campaign?")) {
                        deleteFund.mutate({ id });
                      }
                    }}
                    disabled={deleteFund.isPending}
                  >
                    {deleteFund.isPending ? "Deleting..." : "Delete Campaign"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
