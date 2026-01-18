"use client";

import Link from "next/link";

interface PointsBalanceDisplayProps {
  /** Current points balance */
  points: number;
  /** Whether to show as compact (for header) */
  compact?: boolean;
}

/**
 * Points Balance Display Component
 *
 * Shows the user's points balance with optional link to points page.
 * Story 5-1.
 */
export function PointsBalanceDisplay({ points, compact = false }: PointsBalanceDisplayProps) {
  if (compact) {
    return (
      <Link
        href="/points"
        className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
      >
        <svg
          className="h-4 w-4"
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
        <span>{points}</span>
      </Link>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Points Balance</p>
          <p className="text-3xl font-bold text-primary">{points}</p>
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <svg
            className="h-6 w-6 text-primary"
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
        </div>
      </div>
      {points === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          Earn points by hosting guests at your home.
        </p>
      )}
      <Link
        href="/points"
        className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
      >
        View History →
      </Link>
    </div>
  );
}
