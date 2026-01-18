"use client";

import { useState } from "react";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { api } from "~/trpc/react";

type TabType = "stays" | "hosting";

/**
 * Trips Content Component
 *
 * Shows bookings as both guest (My Stays) and host (My Hosting).
 * Handles approve/decline for pending requests.
 */
export function TripsContent() {
  const [activeTab, setActiveTab] = useState<TabType>("stays");

  const { data, isLoading, refetch } = api.booking.getMyBookings.useQuery();
  const { data: pendingCount } = api.booking.getPendingCount.useQuery();

  const approveBooking = api.booking.approve.useMutation({
    onSuccess: () => {
      toast.success("Booking approved!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const declineBooking = api.booking.decline.useMutation({
    onSuccess: () => {
      toast.success("Booking declined");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const cancelBooking = api.booking.cancel.useMutation({
    onSuccess: () => {
      toast.success("Booking cancelled");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const markCompleted = api.points.markStayCompleted.useMutation({
    onSuccess: (data) => {
      if (data.pointsEarned > 0) {
        toast.success(`Stay completed! You earned ${data.pointsEarned} points.`);
      } else {
        toast.success("Stay marked as completed.");
      }
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }

  const asGuest = data?.asGuest ?? [];
  const asHost = data?.asHost ?? [];

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      DECLINED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
      COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return styles[status] ?? styles.PENDING;
  }

  function formatDateRange(start: Date, end: Date) {
    return `${new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }

  function hasCheckoutPassed(endDate: Date) {
    return new Date(endDate) < new Date();
  }

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setActiveTab("stays")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "stays"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          My Stays ({asGuest.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("hosting")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "hosting"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          My Hosting ({asHost.length})
          {(pendingCount ?? 0) > 0 && (
            <span className="ml-2 rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* My Stays Tab */}
      {activeTab === "stays" && (
        <div className="space-y-4">
          {asGuest.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold">No trips yet</h3>
                <p className="mb-6 text-center text-sm text-muted-foreground">
                  Start exploring homes from fellow artists and book your first stay!
                </p>
                <Button asChild>
                  <Link href="/search">Find Homes</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            asGuest.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="flex gap-4 py-4">
                  {/* Listing Photo */}
                  <Link href={`/search/${booking.home.id}`} className="shrink-0">
                    {booking.home.photos.length > 0 ? (
                      <CldImage
                        src={booking.home.photos[0]!}
                        alt={booking.home.title}
                        width={128}
                        height={96}
                        crop="fill"
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-32 items-center justify-center rounded-lg bg-muted">
                        <svg className="h-8 w-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </Link>

                  {/* Booking Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/search/${booking.home.id}`} className="font-semibold hover:underline">
                          {booking.home.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">{booking.home.location}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">
                      {formatDateRange(booking.startDate, booking.endDate)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Host: {booking.home.owner.name ?? "Member"}
                    </p>
                    {booking.bookingType === "POINTS" && booking.pointsCost && (
                      <p className="text-sm text-muted-foreground">{booking.pointsCost} points</p>
                    )}
                    {booking.bookingType === "SWAP" && (
                      <p className="text-sm text-muted-foreground">Home swap</p>
                    )}

                    {/* Actions for confirmed bookings */}
                    {booking.status === "CONFIRMED" && (
                      <div className="mt-2 flex gap-2">
                        <Button variant="secondary" size="sm" asChild>
                          <Link
                            href={`/messages?user=${booking.home.owner.id}&context=BOOKING_COORDINATION&contextId=${booking.id}`}
                          >
                            Message Host
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to cancel this booking?")) {
                              cancelBooking.mutate({ id: booking.id });
                            }
                          }}
                          disabled={cancelBooking.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* My Hosting Tab */}
      {activeTab === "hosting" && (
        <div className="space-y-4">
          {asHost.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold">No bookings yet</h3>
                <p className="mb-6 text-center text-sm text-muted-foreground">
                  When guests book your listings, they&apos;ll appear here.
                </p>
                <Button asChild>
                  <Link href="/listings">Manage Listings</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            asHost.map((booking) => (
              <Card key={booking.id} className={booking.status === "PENDING" ? "border-amber-500" : ""}>
                <CardContent className="flex gap-4 py-4">
                  {/* Guest Photo */}
                  <Link href={`/members/${booking.guest.id}`} className="shrink-0">
                    {booking.guest.image ? (
                      <CldImage
                        src={booking.guest.image}
                        alt={booking.guest.name ?? "Guest"}
                        width={64}
                        height={64}
                        crop="fill"
                        gravity="face"
                        className="rounded-full"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                        {booking.guest.name?.charAt(0) ?? "?"}
                      </div>
                    )}
                  </Link>

                  {/* Booking Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/members/${booking.guest.id}`} className="font-semibold hover:underline">
                          {booking.guest.name ?? "Guest"}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          wants to stay at {booking.home.title}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">
                      {formatDateRange(booking.startDate, booking.endDate)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.bookingType === "POINTS"
                        ? `${booking.pointsCost} points`
                        : "Home swap"}
                    </p>

                    {/* Actions for pending requests */}
                    {booking.status === "PENDING" && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveBooking.mutate({ id: booking.id })}
                          disabled={approveBooking.isPending || declineBooking.isPending}
                        >
                          {approveBooking.isPending ? "Approving..." : "Approve"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const message = prompt("Optional message for the guest:");
                            declineBooking.mutate({ id: booking.id, message: message ?? undefined });
                          }}
                          disabled={approveBooking.isPending || declineBooking.isPending}
                        >
                          Decline
                        </Button>
                      </div>
                    )}

                    {/* Mark Complete for confirmed bookings after checkout */}
                    {booking.status === "CONFIRMED" && hasCheckoutPassed(booking.endDate) && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => markCompleted.mutate({ reservationId: booking.id })}
                          disabled={markCompleted.isPending}
                        >
                          {markCompleted.isPending ? "Processing..." : "Mark Completed"}
                        </Button>
                      </div>
                    )}

                    {/* Actions for confirmed (before checkout) */}
                    {booking.status === "CONFIRMED" && !hasCheckoutPassed(booking.endDate) && (
                      <div className="mt-3 flex gap-2">
                        <Button variant="secondary" size="sm" asChild>
                          <Link
                            href={`/messages?user=${booking.guest.id}&context=BOOKING_COORDINATION&contextId=${booking.id}`}
                          >
                            Message Guest
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to cancel this booking? The guest will be notified.")) {
                              cancelBooking.mutate({ id: booking.id });
                            }
                          }}
                          disabled={cancelBooking.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    {/* Show completed status */}
                    {booking.status === "COMPLETED" && (
                      <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                        {booking.bookingType === "POINTS" ? "Stay completed - points earned!" : "Stay completed"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
