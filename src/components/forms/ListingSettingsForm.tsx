"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

type BookingMode = "INSTANT_BOOK" | "REQUIRES_APPROVAL";
type ExchangeType = "SWAP_ONLY" | "POINTS_ONLY" | "BOTH";

interface ListingSettingsFormProps {
  listingId: string;
  initialBookingMode: BookingMode;
  initialExchangeType: ExchangeType;
  initialPreferredDestinations: string[];
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
  initialPreferredDestinations,
}: ListingSettingsFormProps) {
  const [bookingMode, setBookingMode] = useState<BookingMode>(initialBookingMode);
  const [exchangeType, setExchangeType] = useState<ExchangeType>(initialExchangeType);
  const [destinations, setDestinations] = useState<string[]>(initialPreferredDestinations);
  const [newDestination, setNewDestination] = useState("");

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

  const updatePreferredDestinations = api.listing.updatePreferredDestinations.useMutation({
    onSuccess: () => {
      toast.success("Preferred destinations updated");
    },
    onError: (error) => {
      toast.error(error.message);
      // Revert on error
      setDestinations(initialPreferredDestinations);
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

  function handleAddDestination() {
    const trimmed = newDestination.trim();
    if (!trimmed) return;
    if (destinations.length >= 10) {
      toast.error("Maximum 10 destinations allowed");
      return;
    }
    if (destinations.includes(trimmed)) {
      toast.error("Destination already added");
      return;
    }
    if (trimmed.length > 100) {
      toast.error("Destination must be 100 characters or less");
      return;
    }
    const updated = [...destinations, trimmed];
    setDestinations(updated);
    setNewDestination("");
    updatePreferredDestinations.mutate({ id: listingId, destinations: updated });
  }

  function handleRemoveDestination(destination: string) {
    const updated = destinations.filter((d) => d !== destination);
    setDestinations(updated);
    updatePreferredDestinations.mutate({ id: listingId, destinations: updated });
  }

  const isUpdating = updateBookingMode.isPending || updateExchangeType.isPending || updatePreferredDestinations.isPending;

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

      {/* Preferred Destinations Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preferred Destinations</CardTitle>
          <CardDescription>
            Where would you like to travel? Adding destinations helps potential swappers identify mutual matches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add destination input */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g., Paris, France"
              value={newDestination}
              onChange={(e) => setNewDestination(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddDestination();
                }
              }}
              disabled={isUpdating || destinations.length >= 10}
              maxLength={100}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddDestination}
              disabled={isUpdating || !newDestination.trim() || destinations.length >= 10}
              variant="secondary"
            >
              Add
            </Button>
          </div>

          {/* Destination tags */}
          {destinations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {destinations.map((destination) => (
                <span
                  key={destination}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {destination}
                  <button
                    type="button"
                    onClick={() => handleRemoveDestination(destination)}
                    disabled={isUpdating}
                    className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                    aria-label={`Remove ${destination}`}
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No destinations added yet. Add places you&apos;d like to visit!
            </p>
          )}

          {/* Character count hint */}
          <p className="text-xs text-muted-foreground">
            {destinations.length}/10 destinations
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
