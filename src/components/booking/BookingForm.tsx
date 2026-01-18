"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

interface AvailabilityPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
}

interface UserHome {
  id: string;
  title: string;
  location: string;
  photos: string[];
}

interface BookingFormProps {
  listingId: string;
  listingTitle: string;
  bookingMode: "INSTANT_BOOK" | "REQUIRES_APPROVAL";
  exchangeType: "SWAP_ONLY" | "POINTS_ONLY" | "BOTH";
  availability: AvailabilityPeriod[];
  userPoints: number;
  userHomes: UserHome[];
}

/**
 * Booking Form Component
 *
 * Allows users to book a listing with date selection and booking type choice.
 * Stories 4-1, 4-2, 4-3.
 */
export function BookingForm({
  listingId,
  listingTitle,
  bookingMode,
  exchangeType,
  availability,
  userPoints,
  userHomes,
}: BookingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<"dates" | "type" | "swap" | "confirm">("dates");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingType, setBookingType] = useState<"POINTS" | "SWAP">("POINTS");
  const [selectedSwapHome, setSelectedSwapHome] = useState<string>("");
  const [swapStartDate, setSwapStartDate] = useState("");
  const [swapEndDate, setSwapEndDate] = useState("");

  const createBooking = api.booking.create.useMutation({
    onSuccess: (data) => {
      if (data.isInstantBook) {
        toast.success("Booking confirmed!");
      } else {
        toast.success("Booking request sent!");
      }
      router.push("/trips");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Calculate nights and points
  const nights = startDate && endDate
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const pointsCost = nights * 100;
  const hasEnoughPoints = userPoints >= pointsCost;

  // Get min date for date inputs
  const today = new Date().toISOString().split("T")[0];

  // Check if dates are within availability
  function areDatesAvailable(start: string, end: string): boolean {
    if (!start || !end) return false;
    const startD = new Date(start);
    const endD = new Date(end);

    return availability.some((period) => {
      const periodStart = new Date(period.startDate);
      const periodEnd = new Date(period.endDate);
      return startD >= periodStart && endD <= periodEnd;
    });
  }

  const datesValid = areDatesAvailable(startDate, endDate);

  function handleSubmit() {
    createBooking.mutate({
      homeId: listingId,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      bookingType,
      swapHomeId: bookingType === "SWAP" ? selectedSwapHome : undefined,
      swapStartDate: bookingType === "SWAP" && swapStartDate ? new Date(swapStartDate).toISOString() : undefined,
      swapEndDate: bookingType === "SWAP" && swapEndDate ? new Date(swapEndDate).toISOString() : undefined,
    });
  }

  // Determine available booking types
  const canUsePoints = exchangeType === "POINTS_ONLY" || exchangeType === "BOTH";
  const canUseSwap = exchangeType === "SWAP_ONLY" || exchangeType === "BOTH";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {bookingMode === "INSTANT_BOOK" ? "Book Now" : "Request to Book"}
        </CardTitle>
        <CardDescription>
          {bookingMode === "INSTANT_BOOK"
            ? "This listing accepts instant bookings"
            : "The host will review your request"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Date Selection */}
        {step === "dates" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Check-in</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Check-out</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {startDate && endDate && !datesValid && (
              <p className="text-sm text-destructive">
                Selected dates are not within the host&apos;s availability.
              </p>
            )}

            {nights > 0 && datesValid && (
              <p className="text-sm text-muted-foreground">
                {nights} night{nights !== 1 ? "s" : ""}
              </p>
            )}

            <Button
              className="w-full"
              onClick={() => setStep("type")}
              disabled={!datesValid || nights === 0}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Booking Type Selection */}
        {step === "type" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">{listingTitle}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()} ({nights} nights)
              </p>
            </div>

            <div className="space-y-3">
              {canUsePoints && (
                <button
                  type="button"
                  onClick={() => setBookingType("POINTS")}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                    bookingType === "POINTS"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Pay with Points</p>
                      <p className="text-sm text-muted-foreground">
                        {pointsCost} points required
                      </p>
                    </div>
                    {bookingType === "POINTS" && (
                      <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className={`mt-2 text-sm ${hasEnoughPoints ? "text-green-600" : "text-destructive"}`}>
                    Your balance: {userPoints} points
                    {!hasEnoughPoints && " (insufficient)"}
                  </p>
                </button>
              )}

              {canUseSwap && (
                <button
                  type="button"
                  onClick={() => setBookingType("SWAP")}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                    bookingType === "SWAP"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Home Swap</p>
                      <p className="text-sm text-muted-foreground">
                        Offer your home in exchange
                      </p>
                    </div>
                    {bookingType === "SWAP" && (
                      <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {userHomes.length === 0 && (
                    <p className="mt-2 text-sm text-destructive">
                      You need to list a home to offer swaps
                    </p>
                  )}
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("dates")}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (bookingType === "SWAP") {
                    setStep("swap");
                  } else {
                    setStep("confirm");
                  }
                }}
                disabled={
                  (bookingType === "POINTS" && !hasEnoughPoints) ||
                  (bookingType === "SWAP" && userHomes.length === 0)
                }
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Swap Details (if swap selected) */}
        {step === "swap" && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Select your home to offer</label>
              <div className="space-y-2">
                {userHomes.map((home) => (
                  <button
                    key={home.id}
                    type="button"
                    onClick={() => setSelectedSwapHome(home.id)}
                    className={`w-full rounded-lg border-2 p-3 text-left transition-colors ${
                      selectedSwapHome === home.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium">{home.title}</p>
                    <p className="text-sm text-muted-foreground">{home.location}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Propose dates for host to stay at your place (optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={swapStartDate}
                  onChange={(e) => setSwapStartDate(e.target.value)}
                  min={today}
                  placeholder="Start"
                  className="rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  type="date"
                  value={swapEndDate}
                  onChange={(e) => setSwapEndDate(e.target.value)}
                  min={swapStartDate || today}
                  placeholder="End"
                  className="rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("type")}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep("confirm")}
                disabled={!selectedSwapHome}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === "confirm" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="font-medium">{listingTitle}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                {" - "}
                {new Date(endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
              <p className="text-sm">{nights} nights</p>
              <hr className="my-2" />
              <p className="text-sm">
                <span className="font-medium">Booking type:</span>{" "}
                {bookingType === "POINTS" ? `${pointsCost} points` : "Home swap"}
              </p>
              {bookingType === "SWAP" && selectedSwapHome && (
                <p className="text-sm text-muted-foreground">
                  Offering: {userHomes.find(h => h.id === selectedSwapHome)?.title}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(bookingType === "SWAP" ? "swap" : "type")}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={createBooking.isPending}
              >
                {createBooking.isPending
                  ? "Processing..."
                  : bookingMode === "INSTANT_BOOK"
                  ? "Confirm Booking"
                  : "Send Request"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
