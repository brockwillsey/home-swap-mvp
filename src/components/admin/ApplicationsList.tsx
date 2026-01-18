"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

/**
 * Applications List Component
 *
 * Shows pending applications with tabs for different statuses.
 * Stories 7-1, 7-2.
 */
export function ApplicationsList() {
  const [activeTab, setActiveTab] = useState<"SUBMITTED" | "NEEDS_INFO">("SUBMITTED");

  const { data: applications, isLoading } = api.application.listPending.useQuery({
    status: activeTab,
  });

  return (
    <div>
      {/* Status Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setActiveTab("SUBMITTED")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "SUBMITTED"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending Review
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("NEEDS_INFO")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "NEEDS_INFO"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Awaiting Info
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : applications?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <div className="mb-4 rounded-full bg-green-100 p-4 dark:bg-green-900/30">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold">No pending applications</h3>
            <p className="text-sm text-muted-foreground">
              {activeTab === "SUBMITTED"
                ? "All applications have been reviewed"
                : "No applications awaiting additional info"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications?.map((app) => (
            <Card key={app.id}>
              <CardContent className="flex items-center gap-4 py-4">
                {/* Profile Photo */}
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted">
                  {app.profilePhotoUrl ? (
                    <Image
                      src={app.profilePhotoUrl}
                      alt={app.name ?? "Applicant"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                      {app.name?.charAt(0) ?? "?"}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="font-semibold">{app.name ?? "No name"}</p>
                  <p className="text-sm text-muted-foreground">
                    {app.location} • Applied{" "}
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                  {activeTab === "NEEDS_INFO" && app.feedback && (
                    <p className="mt-1 text-sm text-amber-600">
                      Requested: {app.feedback.slice(0, 50)}...
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    app.status === "SUBMITTED"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  }`}
                >
                  {app.status === "SUBMITTED" ? "Pending" : "Needs Info"}
                </span>

                {/* Review Button */}
                <Button asChild>
                  <Link href={`/admin/applications/${app.id}`}>Review</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
