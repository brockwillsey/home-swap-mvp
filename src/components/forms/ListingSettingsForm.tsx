"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

type BookingMode = "INSTANT_BOOK" | "REQUIRES_APPROVAL";
type ExchangeType = "SWAP_ONLY" | "POINTS_ONLY" | "BOTH";

interface ListingSettingsFormProps {
  listingId: string;
  initialBookingMode: BookingMode;
  initialExchangeType: ExchangeType;
}

/**
 * Listing Settings Form
 *
 * Allows users to configure booking mode and exchange type preferences
 * for their listing (Stories 2-6 and 2-7).
 */
export function ListingSettingsForm({
  listingId,
  initialBookingMode,
  initialExchangeType,
}: ListingSettingsFormProps) {
  const [bookingMode, setBookingMode] = useState<BookingMode>(initialBookingMode);
  const [exchangeType, setExchangeType] = useState<ExchangeType>(initialExchangeType);

  const updateBookingMode = api.listing.updateBookingMode.useMutation({
    onSuccess: () => {
      toast.success("Booking mode updated");
    },
    onError: (error) => {
      toast.error(error.message);
      // Revert on error
      setBookingMode(initialBookingMode);
    },
  });

  const updateExchangeType = api.listing.updateExchangeType.useMutation({
    onSuccess: () => {
      toast.success("Exchange preferences updated");
    },
    onError: (error) => {
      toast.error(error.message);
      // Revert on error
      setExchangeType(initialExchangeType);
    },
  });

  function handleBookingModeChange(mode: BookingMode) {
    setBookingMode(mode);
    updateBookingMode.mutate({ id: listingId, bookingMode: mode });
  }

  function handleExchangeTypeChange(type: ExchangeType) {
    setExchangeType(type);
    updateExchangeType.mutate({ id: listingId, exchangeType: type });
  }

  const isUpdating = updateBookingMode.isPending || updateExchangeType.isPending;

  return (
    <div className="space-y-6">
      {/* Booking Mode Section */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Mode</CardTitle>
          <CardDescription>
            Choose how guests can book your home. This affects all new booking requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Instant Book Option */}
            <button
              type="button"
              onClick={() => handleBookingModeChange("INSTANT_BOOK")}
              disabled={isUpdating}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                bookingMode === "INSTANT_BOOK"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <svg
                  className={`h-5 w-5 ${
                    bookingMode === "INSTANT_BOOK" ? "text-primary" : "text-muted-foreground"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="font-medium">Instant Book</span>
                {bookingMode === "INSTANT_BOOK" && (
                  <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Guests can book immediately without waiting for your approval. Great for flexibility.
              </p>
            </button>

            {/* Requires Approval Option */}
            <button
              type="button"
              onClick={() => handleBookingModeChange("REQUIRES_APPROVAL")}
              disabled={isUpdating}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                bookingMode === "REQUIRES_APPROVAL"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <svg
                  className={`h-5 w-5 ${
                    bookingMode === "REQUIRES_APPROVAL" ? "text-primary" : "text-muted-foreground"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">Requires Approval</span>
                {bookingMode === "REQUIRES_APPROVAL" && (
                  <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Review and approve each booking request before it&apos;s confirmed. More control over guests.
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Type Section */}
      <Card>
        <CardHeader>
          <CardTitle>Exchange Preferences</CardTitle>
          <CardDescription>
            Choose what types of exchanges you&apos;ll accept for this listing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Both Option */}
            <button
              type="button"
              onClick={() => handleExchangeTypeChange("BOTH")}
              disabled={isUpdating}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                exchangeType === "BOTH"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <svg
                  className={`h-5 w-5 ${
                    exchangeType === "BOTH" ? "text-primary" : "text-muted-foreground"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                <span className="font-medium">Both</span>
              </div>
              {exchangeType === "BOTH" && (
                <span className="mb-2 inline-block rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  Active
                </span>
              )}
              <p className="text-sm text-muted-foreground">
                Accept swaps and points
              </p>
            </button>

            {/* Swaps Only Option */}
            <button
              type="button"
              onClick={() => handleExchangeTypeChange("SWAP_ONLY")}
              disabled={isUpdating}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                exchangeType === "SWAP_ONLY"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <svg
                  className={`h-5 w-5 ${
                    exchangeType === "SWAP_ONLY" ? "text-primary" : "text-muted-foreground"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className="font-medium">Swaps Only</span>
              </div>
              {exchangeType === "SWAP_ONLY" && (
                <span className="mb-2 inline-block rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  Active
                </span>
              )}
              <p className="text-sm text-muted-foreground">
                Only home exchanges
              </p>
            </button>

            {/* Points Only Option */}
            <button
              type="button"
              onClick={() => handleExchangeTypeChange("POINTS_ONLY")}
              disabled={isUpdating}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                exchangeType === "POINTS_ONLY"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <svg
                  className={`h-5 w-5 ${
                    exchangeType === "POINTS_ONLY" ? "text-primary" : "text-muted-foreground"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">Points Only</span>
              </div>
              {exchangeType === "POINTS_ONLY" && (
                <span className="mb-2 inline-block rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  Active
                </span>
              )}
              <p className="text-sm text-muted-foreground">
                Only points bookings
              </p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
