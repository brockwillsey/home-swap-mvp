"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

// Parse photos from JSON string or return as-is if already array
function parsePhotos(photos: string | string[]): string[] {
  if (typeof photos === "string") {
    try {
      return JSON.parse(photos) as string[];
    } catch {
      return [];
    }
  }
  return photos;
}

interface ApplicationDetailProps {
  applicationId: string;
}

/**
 * Application Detail Component
 *
 * Shows full application details with approve/reject/request info actions.
 * Stories 7-2, 7-3, 7-4, 7-5.
 */
export function ApplicationDetail({ applicationId }: ApplicationDetailProps) {
  const router = useRouter();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showInfoRequestForm, setShowInfoRequestForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [requestedInfo, setRequestedInfo] = useState("");

  const { data: application, isLoading } = api.application.getDetails.useQuery({
    applicationId,
  });

  const approveMutation = api.application.approve.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.emailSent
          ? "Application approved! Welcome email sent."
          : "Application approved! (Email failed to send)"
      );
      router.push("/admin/applications");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rejectMutation = api.application.reject.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.refundProcessed
          ? "Application rejected. Refund processed and email sent."
          : "Application rejected. Email sent."
      );
      router.push("/admin/applications");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const requestInfoMutation = api.application.requestMoreInfo.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.emailSent
          ? "Info request sent to applicant."
          : "Status updated. (Email failed to send)"
      );
      router.push("/admin/applications");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }

  if (!application) {
    return <div className="text-center text-muted-foreground">Application not found</div>;
  }

  const canTakeAction = application.status === "SUBMITTED";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/applications"
            className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Applications
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            {application.user.name ?? "Application"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Applied {new Date(application.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            application.status === "SUBMITTED"
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
              : application.status === "NEEDS_INFO"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              : application.status === "APPROVED"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {application.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              {/* Profile Photo */}
              <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full bg-muted">
                {application.profilePhotoUrl ? (
                  <Image
                    src={application.profilePhotoUrl}
                    alt={application.user.name ?? "Applicant"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl text-muted-foreground">
                    {application.user.name?.charAt(0) ?? "?"}
                  </div>
                )}
              </div>

              <h2 className="text-xl font-semibold">
                {application.user.name ?? "No name"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {application.user.email}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {application.location}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bio */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Bio</h3>
              <p className="whitespace-pre-wrap">{application.bio}</p>
            </div>

            {/* Membership Roles */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Membership Roles
              </h3>
              <p>
                {(() => {
                  try {
                    const roles = JSON.parse(application.roles) as string[];
                    return roles.map(r => r.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())).join(', ');
                  } catch {
                    return application.roles;
                  }
                })()}
              </p>
            </div>

            {/* Portfolio URL - for artists */}
            {application.portfolioUrl && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Portfolio
                </h3>
                <a href={application.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {application.portfolioUrl}
                </a>
              </div>
            )}

            {/* Studio/Gallery Referral */}
            {application.studioGalleryReferral && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Studio/Gallery Referral
                </h3>
                <p className="whitespace-pre-wrap">{application.studioGalleryReferral}</p>
              </div>
            )}

            {/* Reason for Joining */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Reason for Joining
              </h3>
              <p className="whitespace-pre-wrap">{application.reasonForJoining}</p>
            </div>

            {/* Previous Feedback */}
            {application.feedback && application.status === "NEEDS_INFO" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <h3 className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-400">
                  Requested Information
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {application.feedback}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Home Photos */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Home Photos</CardTitle>
            <CardDescription>
              {parsePhotos(application.homePhotos).length} photo{parsePhotos(application.homePhotos).length !== 1 ? "s" : ""} submitted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {parsePhotos(application.homePhotos).map((photo: string, index: number) => (
                <div
                  key={index}
                  className="relative aspect-video overflow-hidden rounded-lg bg-muted"
                >
                  <Image
                    src={photo}
                    alt={`Home photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {canTakeAction && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Review and process this application</CardDescription>
            </CardHeader>
            <CardContent>
              {!showRejectForm && !showInfoRequestForm ? (
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      if (confirm("Are you sure you want to approve this application?")) {
                        approveMutation.mutate({ applicationId });
                      }
                    }}
                    disabled={approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {approveMutation.isPending ? "Approving..." : "Approve"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowRejectForm(true)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowInfoRequestForm(true)}
                  >
                    Request More Info
                  </Button>
                </div>
              ) : showRejectForm ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Rejection Feedback
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Explain why the application was rejected..."
                      rows={4}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Minimum 10 characters. This will be sent to the applicant.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => rejectMutation.mutate({ applicationId, feedback })}
                      disabled={feedback.length < 10 || rejectMutation.isPending}
                    >
                      {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRejectForm(false);
                        setFeedback("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      What information do you need?
                    </label>
                    <textarea
                      value={requestedInfo}
                      onChange={(e) => setRequestedInfo(e.target.value)}
                      placeholder="Specify what additional information is needed..."
                      rows={4}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Minimum 10 characters. This will be sent to the applicant.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        requestInfoMutation.mutate({ applicationId, requestedInfo })
                      }
                      disabled={requestedInfo.length < 10 || requestInfoMutation.isPending}
                    >
                      {requestInfoMutation.isPending ? "Sending..." : "Send Request"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowInfoRequestForm(false);
                        setRequestedInfo("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
