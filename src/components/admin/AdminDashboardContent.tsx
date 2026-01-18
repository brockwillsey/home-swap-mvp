"use client";

import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

/**
 * Admin Dashboard Content
 *
 * Shows platform stats and recent activity.
 * Story 7-8.
 */
export function AdminDashboardContent() {
  const { data: stats, isLoading: statsLoading } = api.admin.getStats.useQuery();
  const { data: activity, isLoading: activityLoading } = api.admin.getRecentActivity.useQuery();

  if (statsLoading || activityLoading) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Key Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Members</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalMembers ?? 0}</p>
            <p className="text-sm text-muted-foreground">
              +{stats?.newMembersMonth ?? 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Listings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalListings ?? 0}</p>
            <p className="text-sm text-muted-foreground">
              +{stats?.newListingsMonth ?? 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalBookings ?? 0}</p>
            <p className="text-sm text-muted-foreground">
              {stats?.completedBookings ?? 0} completed
            </p>
          </CardContent>
        </Card>

        <Link href="/admin/applications">
          <Card className="cursor-pointer transition-colors hover:border-primary">
            <CardHeader className="pb-2">
              <CardDescription>Pending Applications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">
                {stats?.pendingApplications ?? 0}
              </p>
              <p className="text-sm text-primary">Review now →</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Growth Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">New Members</span>
                <span className="font-semibold text-green-600">
                  +{stats?.newMembersWeek ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">New Listings</span>
                <span className="font-semibold text-green-600">
                  +{stats?.newListingsWeek ?? 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">New Members</span>
                <span className="font-semibold">{stats?.newMembersMonth ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">New Listings</span>
                <span className="font-semibold">{stats?.newListingsMonth ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bookings</span>
                <span className="font-semibold">{stats?.bookingsThisMonth ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Members</CardTitle>
            <CardDescription>Recently approved</CardDescription>
          </CardHeader>
          <CardContent>
            {activity?.recentMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent members</p>
            ) : (
              <div className="space-y-4">
                {activity?.recentMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {member.name?.charAt(0) ?? "?"}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium">{member.name ?? "Member"}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.approvedAt
                          ? new Date(member.approvedAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Listings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Listings</CardTitle>
            <CardDescription>Newly created</CardDescription>
          </CardHeader>
          <CardContent>
            {activity?.recentListings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent listings</p>
            ) : (
              <div className="space-y-4">
                {activity?.recentListings.map((listing) => (
                  <div key={listing.id} className="flex-1 overflow-hidden">
                    <p className="truncate font-medium">{listing.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {listing.location} • by {listing.ownerName ?? "Member"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
            <CardDescription>Latest activity</CardDescription>
          </CardHeader>
          <CardContent>
            {activity?.recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent bookings</p>
            ) : (
              <div className="space-y-4">
                {activity?.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex-1 overflow-hidden">
                    <p className="truncate font-medium">
                      {booking.guestName ?? "Guest"} → {booking.listingTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span
                        className={
                          booking.status === "CONFIRMED"
                            ? "text-green-600"
                            : booking.status === "PENDING"
                            ? "text-amber-600"
                            : ""
                        }
                      >
                        {booking.status}
                      </span>
                      {" • "}
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
