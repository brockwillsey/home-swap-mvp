"use client";

import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";

interface AvailabilityPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
}

interface AvailabilityDisplayProps {
  availability: AvailabilityPeriod[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Availability Display Component
 *
 * Shows a read-only calendar view of listing availability.
 * Used on the listing detail page.
 */
export function AvailabilityDisplay({ availability }: AvailabilityDisplayProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

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
  function isDateAvailable(date: Date): boolean {
    return availability.some((period) => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    });
  }

  // Check if date is in the past
  function isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  function navigateMonth(delta: number) {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + delta);
      return newDate;
    });
  }

  if (availability.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/50 p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-muted-foreground/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-4 text-muted-foreground">
          No availability set yet. Contact the host to inquire about dates.
        </p>
      </div>
    );
  }

  return (
    <div>
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
      <div>
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
            const past = isPastDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={date.toISOString()}
                className={`
                  aspect-square flex items-center justify-center rounded-md text-sm
                  ${past ? "text-muted-foreground/40" : ""}
                  ${available && !past ? "bg-green-500/20 text-green-700 dark:text-green-400" : ""}
                  ${isToday && !available ? "ring-2 ring-primary ring-offset-1" : ""}
                `}
              >
                {date.getDate()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-green-500/20" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded ring-2 ring-primary" />
          <span>Today</span>
        </div>
      </div>

      {/* Availability List */}
      <div className="mt-6">
        <h4 className="mb-2 text-sm font-medium">Available Periods</h4>
        <div className="space-y-2">
          {availability.map((period) => (
            <div
              key={period.id}
              className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm dark:bg-green-950/20"
            >
              <svg
                className="h-4 w-4 text-green-500"
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
              <span>
                {new Date(period.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {" - "}
                {new Date(period.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
