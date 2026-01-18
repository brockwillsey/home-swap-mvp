"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

interface AvailabilityPeriod {
  id: string;
  homeId: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

interface AvailabilityCalendarProps {
  listingId: string;
  initialAvailability: AvailabilityPeriod[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Availability Calendar Component
 *
 * Allows users to set and manage availability periods for their listing.
 * Displays a month view with clickable dates to select ranges.
 */
export function AvailabilityCalendar({
  listingId,
  initialAvailability,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectStart, setSelectStart] = useState<Date | null>(null);
  const [selectEnd, setSelectEnd] = useState<Date | null>(null);

  const utils = api.useUtils();

  const { data: availability = initialAvailability } = api.listing.getAvailability.useQuery(
    { id: listingId },
    { initialData: initialAvailability }
  );

  const addAvailability = api.listing.addAvailability.useMutation({
    onSuccess: () => {
      toast.success("Availability added");
      setSelectStart(null);
      setSelectEnd(null);
      utils.listing.getAvailability.invalidate({ id: listingId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeAvailability = api.listing.removeAvailability.useMutation({
    onSuccess: () => {
      toast.success("Availability removed");
      utils.listing.getAvailability.invalidate({ id: listingId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Get days in current month view
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: (Date | null)[] = [];

    // Add empty slots for days before first of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  // Check if a date is within any availability period
  function isDateAvailable(date: Date): AvailabilityPeriod | null {
    return availability.find((period) => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      return date >= start && date <= end;
    }) ?? null;
  }

  // Check if date is in selection range
  function isInSelection(date: Date): boolean {
    if (!selectStart) return false;
    if (!selectEnd) return date.toDateString() === selectStart.toDateString();
    const start = selectStart < selectEnd ? selectStart : selectEnd;
    const end = selectStart < selectEnd ? selectEnd : selectStart;
    return date >= start && date <= end;
  }

  // Check if date is in the past
  function isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  function handleDateClick(date: Date) {
    if (isPastDate(date)) return;

    // Check if clicking on existing availability
    const existingPeriod = isDateAvailable(date);
    if (existingPeriod && !selectStart) {
      // Confirm before removing
      if (confirm("Remove this availability period?")) {
        removeAvailability.mutate({ id: existingPeriod.id });
      }
      return;
    }

    // Start or complete selection
    if (!selectStart) {
      setSelectStart(date);
      setSelectEnd(null);
    } else if (!selectEnd) {
      setSelectEnd(date);
    } else {
      // Reset selection
      setSelectStart(date);
      setSelectEnd(null);
    }
  }

  function handleSaveSelection() {
    if (!selectStart || !selectEnd) return;

    const start = selectStart < selectEnd ? selectStart : selectEnd;
    const end = selectStart < selectEnd ? selectEnd : selectStart;

    addAvailability.mutate({
      homeId: listingId,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
  }

  function handleCancelSelection() {
    setSelectStart(null);
    setSelectEnd(null);
  }

  function navigateMonth(delta: number) {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + delta);
      return newDate;
    });
  }

  const isAdding = addAvailability.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability Calendar</CardTitle>
        <CardDescription>
          Click to select dates when your home is available for guests.
          Click on existing availability (green) to remove it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Month Navigation */}
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth(-1)}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <h3 className="font-semibold">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth(1)}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="mb-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground">
            {DAYS.map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, i) => {
              if (!date) {
                return <div key={`empty-${i}`} className="aspect-square" />;
              }

              const available = isDateAvailable(date);
              const inSelection = isInSelection(date);
              const past = isPastDate(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  disabled={past || isAdding}
                  className={`
                    aspect-square flex items-center justify-center rounded-md text-sm transition-colors
                    ${past ? "text-muted-foreground/50 cursor-not-allowed" : "cursor-pointer hover:bg-muted"}
                    ${available ? "bg-green-500/80 text-white hover:bg-green-600" : ""}
                    ${inSelection && !available ? "bg-primary text-primary-foreground" : ""}
                    ${isToday && !available && !inSelection ? "ring-2 ring-primary ring-offset-1" : ""}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selection Actions */}
        {selectStart && (
          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <div className="text-sm">
              {selectEnd ? (
                <>
                  Selected: {selectStart.toLocaleDateString()} - {selectEnd.toLocaleDateString()}
                </>
              ) : (
                <>
                  Start: {selectStart.toLocaleDateString()} - Click another date to complete range
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelSelection}
                disabled={isAdding}
              >
                Cancel
              </Button>
              {selectEnd && (
                <Button
                  size="sm"
                  onClick={handleSaveSelection}
                  disabled={isAdding}
                >
                  {isAdding ? "Saving..." : "Save Availability"}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-green-500/80" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-primary" />
            <span>Selecting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded ring-2 ring-primary" />
            <span>Today</span>
          </div>
        </div>

        {/* Existing Availability List */}
        {availability.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-2 font-medium">Current Availability Periods</h4>
            <div className="space-y-2">
              {availability.map((period) => (
                <div
                  key={period.id}
                  className="flex items-center justify-between rounded-md border bg-green-50 p-3 dark:bg-green-950/20"
                >
                  <span className="text-sm">
                    {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Remove this availability period?")) {
                        removeAvailability.mutate({ id: period.id });
                      }
                    }}
                    disabled={removeAvailability.isPending}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
